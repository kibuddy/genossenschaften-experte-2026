# Beschlussgenerator eG

**Beschluss-Generator für Vorstände und Organe von Genossenschaften (eG)** – Teil der GenoPilot-AI-Plattform.

Vorstände tragen Stichpunkte ein; das System bestimmt deterministisch die rechtliche Einordnung nach GenG und Satzung (zuständiges Organ, Beschlussart, Mehrheit, Eskalation), formuliert per KI einen sauberen Entwurf und prüft bestehende Beschlüsse auf Pflichtbestandteile. Positionierung: **unterstützendes Werkzeug, keine Rechtsberatung** – die Verantwortung bleibt beim Vorstand.

## Schnellstart (Prototyp V8.2)

```bash
ANTHROPIC_API_KEY=sk-ant-... node phase-1/dev-proxy/server.mjs
# → http://localhost:8787/   (ohne Key läuft die UI ohne KI-Formulierung)
```

Tests der Regel-Engine:

```bash
node --test phase-2/packages/geng-engine/engine.test.mjs
```

## Struktur

| Pfad | Inhalt |
|---|---|
| `docs/01-pruefbericht.md` | **Audit des Prototyps V8.1** – Technik, GenG, EU AI Act (Stand 06/2026), DSGVO |
| `docs/02-roadmap.md` | Zielarchitektur & 4-Phasen-Roadmap |
| `docs/03-remotion-konzept.md` | Visuelles Konzept (Remotion-Kompositionen K1–K5) |
| `phase-1/` | **V8.2 – umgesetzt:** Prototyp mit allen kritischen Fixes (XSS, AR-Bug, Modell `claude-opus-4-8`, KI über EU-Proxy), Supabase Edge Function, lokaler Dev-Proxy |
| `phase-2/` | **Gerüst:** SQL-Schema mit RLS + Audit-Hash-Kette + Nummernvergabe (V/GV/AR), extrahierte Regel-Engine `geng-engine` mit versionierter Wissensbasis und Tests |
| `phase-3/` | **Vorlagen:** AI-Act-Assessment (Stichtag 02.08.2026), DSFA-Checkliste, AVV-Checkliste |
| `phase-4/` | Integrations-Spezifikation (Mitglieder-/Versammlungsmodul, E-Signatur, KI-Assistent) |
| `prototyp/` | Original V8.1 (unverändert, Referenz für das Audit) |

## Status

- ✅ Audit abgeschlossen (`docs/01-pruefbericht.md`)
- ✅ Phase 1 umgesetzt: V8.2 end-to-end lauffähig, 12/12 Engine-Tests grün
- 🔜 Phase 2: Supabase-Projekt (EU) anlegen, Next.js-Umbau (`phase-2/README.md`)
- ⏳ Phase 3: rechtliche Abnahmen vor dem 02.08.2026 (`phase-3/README.md`)

## Dieses Verzeichnis als eigenes Repo „Beschlussgenerator-eG" anlegen

Die Claude-Session konnte kein neues GitHub-Repo erstellen (Berechtigung der Integration). So überführst du den Ordner in ein eigenes Repo:

```bash
# 1. Leeres Repo kibuddy/Beschlussgenerator-eG auf GitHub anlegen (ohne README)
# 2. Lokal aus diesem Repo heraus:
git clone https://github.com/kibuddy/genossenschaften-experte-2026 -b claude/beschlussgenerator-audit-nyyrdj
cd genossenschaften-experte-2026
git subtree split -P beschlussgenerator-eg -b beschlussgenerator-export
git push https://github.com/kibuddy/Beschlussgenerator-eG.git beschlussgenerator-export:main
```

Alternativ: neues Repo anlegen, der Claude-GitHub-Integration freigeben und die nächste Claude-Session mit beiden Repos starten – dann übernimmt Claude den Umzug.

---
*Dieses Projekt erstellt Entwürfe zur Arbeitserleichterung und ersetzt keine Rechts-, Steuer- oder Finanzberatung. Rechtliche Inhalte stehen unter juristischem Abnahmevorbehalt (siehe `phase-2/packages/geng-engine/README.md`).*
