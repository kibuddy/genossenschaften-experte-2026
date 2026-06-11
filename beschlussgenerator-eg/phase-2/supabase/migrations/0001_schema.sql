-- =============================================================================
-- Phase 2: Datenmodell Beschluss-Generator (Entwurf – noch nicht deployt)
-- Mandantentrennung über Row-Level-Security (eine Zeile "eg" = eine Genossenschaft)
-- =============================================================================

create extension if not exists pgcrypto; -- für digest() in der Audit-Hash-Kette

-- ---------------------------------------------------------------------------
-- Mandanten & Mitarbeiter-Zuordnung
-- ---------------------------------------------------------------------------
create table eg (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sitz        text,
  created_at  timestamptz not null default now()
);

create table eg_mitarbeiter (
  eg_id    uuid not null references eg(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  rolle    text not null default 'vorstand' check (rolle in ('vorstand','aufsichtsrat','verwaltung')),
  primary key (eg_id, user_id)
);

-- Hilfsfunktion für alle Policies: gehört der eingeloggte Nutzer zu dieser eG?
create or replace function ist_eg_mitarbeiter(p_eg uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from eg_mitarbeiter m
    where m.eg_id = p_eg and m.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Satzungsprofil (entspricht dem eG-Profil aus dem Prototyp)
-- ---------------------------------------------------------------------------
create table eg_profile (
  eg_id               uuid primary key references eg(id) on delete cascade,
  foerderzweck        text,
  mitglieder          int,
  vorstand_anzahl     int not null default 1,
  geschaeftsanteil    numeric,
  hat_aufsichtsrat    boolean not null default false,
  weisungsrecht       boolean not null default false,   -- § 27 Abs. 2 GenG (nur ≤ 20 Mitglieder)
  umlauf_zulaessig    boolean not null default true,    -- § 43b Abs. 2 GenG (Satzungsgrundlage)
  digital_zulaessig   boolean not null default false,   -- virtuelle/hybride Vorstands-/AR-Sitzungen
  invest_mitglieder   boolean not null default false,   -- § 8 Abs. 2 GenG
  grenze_invest       numeric,
  grenze_darlehen     numeric,
  grenze_dauerschuld  numeric,
  quorum              int,
  mehrheit_satzung    text not null default '0,75',
  zustimmungskatalog  text[] not null default '{}',
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Beschlüsse & lückenlose Nummernvergabe (Zählkreise V / GV / AR je Jahr)
-- ---------------------------------------------------------------------------
create table beschluesse (
  id              uuid primary key default gen_random_uuid(),
  eg_id           uuid not null references eg(id) on delete cascade,
  nummer          text,                                  -- z. B. 2026-GV-007 (erst bei Finalisierung)
  kreis           text check (kreis in ('V','GV','AR')),
  jahr            int,
  status          text not null default 'entwurf' check (status in ('entwurf','final','archiviert')),
  vorgang_typ     text not null,                         -- Regel-ID aus der geng-engine (regeln.json)
  organ           text,
  titel           text,
  inhalt          jsonb not null,                        -- Eingaben + Engine-Ergebnis (resolve)
  dokument_text   text,
  ki_formuliert   boolean not null default false,        -- Art. 50 EU AI Act (Transparenz)
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  finalisiert_at  timestamptz
);
create index on beschluesse (eg_id, jahr, kreis);

create table beschluss_nummern (
  eg_id      uuid not null references eg(id) on delete cascade,
  kreis      text not null check (kreis in ('V','GV','AR')),
  jahr       int  not null,
  letzte_nr  int  not null default 0,
  primary key (eg_id, kreis, jahr)
);

-- Transaktionale, lückenlose Vergabe (ersetzt den localStorage-Zähler aus V8.x).
-- Row-Lock über INSERT ... ON CONFLICT DO UPDATE → keine Doppelvergabe bei Parallelzugriff.
create or replace function naechste_beschlussnummer(p_eg uuid, p_kreis text, p_jahr int)
returns text language plpgsql security definer set search_path = public as $$
declare v_nr int;
begin
  if not ist_eg_mitarbeiter(p_eg) then
    raise exception 'Kein Zugriff auf diese Genossenschaft';
  end if;
  insert into beschluss_nummern (eg_id, kreis, jahr, letzte_nr)
  values (p_eg, p_kreis, p_jahr, 1)
  on conflict (eg_id, kreis, jahr)
  do update set letzte_nr = beschluss_nummern.letzte_nr + 1
  returning letzte_nr into v_nr;
  return format('%s-%s-%s', p_jahr, p_kreis, lpad(v_nr::text, 3, '0'));
end;
$$;

-- ---------------------------------------------------------------------------
-- Revisionssichere Ablage: Audit-Log mit Hash-Kette
-- (ersetzt die rein lokale SHA-256-Prüfsumme aus V8.x; KEINE eIDAS-Signatur)
-- ---------------------------------------------------------------------------
create table audit_log (
  id            bigint generated always as identity primary key,
  eg_id         uuid not null references eg(id) on delete cascade,
  beschluss_id  uuid references beschluesse(id) on delete set null,
  aktion        text not null,                           -- z. B. 'erstellt','finalisiert','heruntergeladen'
  payload       jsonb not null default '{}',
  prev_hash     text,
  hash          text not null,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);
create index on audit_log (eg_id, id);

create or replace function audit_hash_kette()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_prev text;
begin
  select hash into v_prev from audit_log where eg_id = new.eg_id order by id desc limit 1;
  new.prev_hash := v_prev;
  new.hash := encode(digest(coalesce(v_prev,'') || new.aktion || new.payload::text || now()::text, 'sha256'), 'hex');
  return new;
end;
$$;
create trigger trg_audit_hash before insert on audit_log
  for each row execute function audit_hash_kette();

-- ---------------------------------------------------------------------------
-- Row-Level-Security: strikte Mandantentrennung
-- ---------------------------------------------------------------------------
alter table eg               enable row level security;
alter table eg_mitarbeiter   enable row level security;
alter table eg_profile       enable row level security;
alter table beschluesse      enable row level security;
alter table beschluss_nummern enable row level security;
alter table audit_log        enable row level security;

create policy eg_select on eg for select using (ist_eg_mitarbeiter(id));
create policy eg_update on eg for update using (ist_eg_mitarbeiter(id));

create policy mit_select on eg_mitarbeiter for select using (ist_eg_mitarbeiter(eg_id));

create policy profil_all on eg_profile for all
  using (ist_eg_mitarbeiter(eg_id)) with check (ist_eg_mitarbeiter(eg_id));

create policy beschluss_all on beschluesse for all
  using (ist_eg_mitarbeiter(eg_id)) with check (ist_eg_mitarbeiter(eg_id));

-- Nummern & Audit-Log: lesen ja, schreiben nur über die definierten Funktionen/Trigger
create policy nummern_select on beschluss_nummern for select using (ist_eg_mitarbeiter(eg_id));
create policy audit_select   on audit_log         for select using (ist_eg_mitarbeiter(eg_id));
create policy audit_insert   on audit_log         for insert with check (ist_eg_mitarbeiter(eg_id));
-- Bewusst KEINE update/delete-Policies auf audit_log → Einträge sind unveränderlich.

-- Anlage neuer eG (Onboarding) erfolgt über eine Service-Role-Funktion in Phase 2,
-- nicht über direkte Inserts der Nutzer.
