# Phase 2 – Mandantenfähig & revisionssicher (Gerüst)

Dieses Verzeichnis enthält die vorbereiteten Bausteine für die Produktversion. Noch **nicht deployt** – das Supabase-Projekt (EU-Region!) wird zu Beginn von Phase 2 angelegt.

## Inhalt

| Pfad | Inhalt | Status |
|---|---|---|
| `supabase/migrations/0001_schema.sql` | Datenmodell: `eg`, `eg_mitarbeiter`, `eg_profile`, `beschluesse`, `beschluss_nummern`, `audit_log` – komplett mit **Row-Level-Security** (Mandantentrennung), transaktionaler Nummernvergabe (`naechste_beschlussnummer()`, Zählkreise V/GV/AR je Jahr) und **Audit-Hash-Kette** (Trigger, Einträge unveränderlich) | Entwurf, reviewt gegen den Prototyp |
| `packages/geng-engine/` | Extrahierte Regel-Engine + versionierte Wissensbasis + Tests | Lauffähig (`node --test …/engine.test.mjs`) |

## Offene Arbeitspakete Phase 2

1. Supabase-Projekt in EU-Region anlegen, Migration einspielen, Auth (Magic-Link) aktivieren.
2. Next.js-App: UI des Prototyps komponentisieren, Engine aus `packages/geng-engine` einbinden.
3. Edge Function aus Phase 1 auf Auth umstellen (`--no-verify-jwt` entfernen), CORS auf App-Domain.
4. Beschluss-Lebenszyklus: Entwurf → final (Nummernvergabe + Audit-Eintrag) → archiviert.
5. Echte **DOCX**-Erzeugung (`docx`-Bibliothek) + **PDF/A**-Export statt HTML-„.doc".
6. Onboarding-Funktion (Service-Role) zum Anlegen neuer eG + Erst-Mitarbeiter.
7. Juristische Abnahme der Wissensbasis (siehe `packages/geng-engine/README.md`).
