# Version

**Aktuelle Version: V8.2** · Stand: 11.06.2026 · Branch: `claude/beschlussgenerator-audit-nyyrdj`

| Komponente | Version / Stand | Status |
|---|---|---|
| Beschluss-Generator (App) | **V8.2** (`phase-1/app/beschluss-generator-v8.2.html`) | lauffähig, demo-fähig |
| KI-Proxy (Supabase Edge Function + Dev-Proxy) | 1.0 · Modell `claude-opus-4-8`, API-Version `2023-06-01`, Structured Outputs | bereit zum Deploy (EU-Region) |
| Regel-Engine `geng-engine` | Wissensbasis **2026-06** (19 Regeln) | 12/12 Tests grün · juristische Abnahme offen |
| Datenmodell (SQL, Phase 2) | Migration `0001_schema.sql` | Entwurf, nicht deployt |
| Compliance-Vorlagen (Phase 3) | je 0.9 (Entwurf) | Abnahme offen · Stichtag Art. 50: **02.08.2026** |
| Original-Prototyp | V8.1 (`prototyp/`) | eingefroren, nur Referenz |

---

## Änderungshistorie

### V8.2 — 11.06.2026

**Sicherheit & Funktionsfähigkeit (kritische Fixes aus dem Audit, `docs/01-pruefbericht.md`):**
- **A1/A2 – KI-Anbindung:** Aufruf läuft jetzt über den serverseitigen EU-Proxy (`/api/ki-formulierung`, per `window.KI_ENDPOINT` übersteuerbar). API-Key, Pflicht-Header (`x-api-key`, `anthropic-version`) und Modell liegen serverseitig. Modellwechsel von `claude-sonnet-4-20250514` (Abschaltung 15.06.2026) auf **`claude-opus-4-8`**; Antwortformat per Structured Outputs (JSON-Schema) garantiert.
- **A3 – XSS-Fix:** Nutzereingaben werden vor dem Einfügen in die Entwurfsanzeige escaped (`escHtml()` in `renderDoc()`).
- **A4 – Aufsichtsrats-Fix:** Neuer Beschlusstyp **„AR-Beschluss"** (`artFuer()`), eigener Nummern-Zählkreis **AR** (`JJJJ-AR-nnn`), „Der Aufsichtsrat" im Dokumenttext; Prüfmodus erkennt AR-Nummern.

**Verbesserungen:**
- **B2 –** eG-Profil wird in `localStorage` gespeichert und beim Laden wiederhergestellt (Zwischenlösung bis Phase 2).
- **B6 –** Sitzungsform „schriftlich" wählt automatisch die Dokumentvariante „Schriftl./elektr. Beschluss" vor.

**Neu im Projekt:**
- Supabase Edge Function `ki-formulierung` + dependency-freier Dev-Proxy (`phase-1/`).
- Regel-Engine als Paket `geng-engine` extrahiert; Regeltexte als versionierte, juristisch abnehmbare Wissensbasis `regeln.json` inkl. Audit-Prüfhinweisen (§ 16, § 43 Abs. 6 GenG); Testsuite mit AR-Regressionstest (`phase-2/packages/geng-engine/`).
- SQL-Schema mit Row-Level-Security, transaktionaler Nummernvergabe und Audit-Hash-Kette (`phase-2/supabase/migrations/`).
- Compliance-Vorlagen: AI-Act-Assessment, DSFA-Checkliste, AVV-Checkliste (`phase-3/`).
- Integrations-Spezifikation für die GenoPilot-Plattform (`phase-4/`).

### V8.1 — Ausgangsstand (vor dem Audit)

- Single-File-Prototyp: deterministische Regel-Engine (19 Vorgangsarten), Beschluss-Erzeugung und -Prüfung, Pseudonymisierung, KI-Qualitätscheck, lokale Beschlussnummern (V/GV), SHA-256-Prüfsumme im Download.
- Bekannte Mängel: siehe `docs/01-pruefbericht.md` (KI-Aufruf funktionsunfähig, Key-Handling, XSS, AR-Bug u. a.) — alle kritischen Punkte in V8.2 behoben.

---

## Nächste Version (geplant: Phase 2)

- Supabase-Projekt (EU) anlegen, Migration deployen, Auth aktivieren
- Next.js-Umbau mit `geng-engine` als gemeinsamer Logik
- Serverseitige Beschlussnummern und Audit-Log statt `localStorage`
- Echte DOCX-/PDF/A-Erzeugung
- Juristische Abnahme der Wissensbasis → `review_status` in `regeln.json` aktualisieren
