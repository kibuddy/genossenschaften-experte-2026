# Beschlussgenerator eG

**Beschluss-Generator für Vorstände und Organe von Genossenschaften (eG)** – Teil der GenoPilot-AI-Plattform.

Vorstände tragen Stichpunkte ein; das System bestimmt deterministisch die rechtliche Einordnung nach GenG und Satzung (zuständiges Organ, Beschlussart, Mehrheit, Eskalation), formuliert per KI einen sauberen Entwurf und prüft bestehende Beschlüsse auf Pflichtbestandteile. Positionierung: **unterstützendes Werkzeug, keine Rechtsberatung** – die Verantwortung bleibt beim Vorstand.

## Master-Bauplan (Single Source of Truth)

**→ [`docs/00-MASTER-BAUPLAN.md`](docs/00-MASTER-BAUPLAN.md)**  
Konsolidierter Bauplan v1.0 (21.08.2026): Vision, Architektur, GenG-Abgleich, Regel-Engine, Wettbewerbs-Analyse (Resolvio), Phases, Compliance, priorisierte Deliverables für Grok Build.

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
| `docs/00-MASTER-BAUPLAN.md` | **Master-Bauplan v1.0** – verbindliche Single Source of Truth |
| `docs/01-pruefbericht.md` | Audit des Prototyps V8.1 – Technik, GenG, EU AI Act, DSGVO |
| `docs/02-roadmap.md` | Zielarchitektur & 4-Phasen-Roadmap (historisch) |
| `docs/03-remotion-konzept.md` | Visuelles Konzept (Remotion-Kompositionen K1–K5) |
| `phase-1/` | **V8.2 – umgesetzt:** Prototyp mit allen kritischen Fixes |
| `phase-2/` | **Gerüst:** SQL-Schema + RLS + geng-engine |
| `phase-3/` | Compliance-Vorlagen (AI-Act, DSFA, AVV) |
| `phase-4/` | Integrations-Spezifikation |
| `prototyp/` | Original V8.1 (Referenz) |

## Status

- ✅ Audit abgeschlossen
- ✅ Phase 1 umgesetzt: V8.2 end-to-end lauffähig, 12/12 Engine-Tests grün
- ✅ Master-Bauplan v1.0 erstellt (21.08.2026)
- 🔜 Phase 2: Supabase (EU) + Next.js + Lebenszyklus
- ⏳ Phase 3: rechtliche Abnahmen vor dem 02.08.2026

## Dieses Verzeichnis als eigenes Repo „Beschlussgenerator-eG“ anlegen

```bash
# 1. Leeres Repo kibuddy/Beschlussgenerator-eG auf GitHub anlegen (ohne README)
# 2. Lokal:
git clone https://github.com/kibuddy/genossenschaften-experte-2026 -b claude/beschlussgenerator-audit-nyyrdj
cd genossenschaften-experte-2026
git subtree split -P beschlussgenerator-eg -b beschlussgenerator-export
git push https://github.com/kibuddy/Beschlussgenerator-eG.git beschlussgenerator-export:main
```

---
*Dieses Projekt erstellt Entwürfe zur Arbeitserleichterung und ersetzt keine Rechts-, Steuer- oder Finanzberatung. Rechtliche Inhalte stehen unter juristischem Abnahmevorbehalt.*
