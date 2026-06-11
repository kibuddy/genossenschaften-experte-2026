# Beschlussgenerator eG

**Beschluss-Generator für Vorstände und Organe von Genossenschaften (eG)** – Teil der GenoPilot-AI-Plattform.

> Hinweis: Dieser Ordner ist als eigenständiges Repo „Beschlussgenerator-eG" konzipiert. Das automatische Anlegen eines neuen GitHub-Repos war mit den Berechtigungen dieser Session nicht möglich (403). Sobald das leere Repo `kibuddy/Beschlussgenerator-eG` existiert und für die Integration freigegeben ist, kann dieser Ordner 1:1 dorthin überführt werden.

## Was ist das?

Ein Werkzeug, das Vorständen kleiner Genossenschaften hilft:

1. **Beschluss erzeugen** – aus Stichpunkten wird ein formal sauberer Beschluss-Entwurf (Sitzungsbeschluss, Umlaufbeschluss, Protokollauszug oder Aktenvermerk), inkl. rechtlicher Einordnung nach GenG und Satzung (Zuständigkeit Vorstand / Generalversammlung / Aufsichtsrat, Mehrheiten, Stimmverbote, Eskalationsempfehlungen).
2. **Beschluss prüfen** – Formalkontrolle eines bestehenden Beschlusstextes gegen Pflichtbestandteile mit konkreten Passus-Vorschlägen.

Positionierung: **unterstützendes Werkzeug, keine Rechtsberatung.** Die Verantwortung bleibt beim Vorstand (Mensch-in-der-Schleife).

## Inhalt dieses Ordners

| Pfad | Inhalt |
|---|---|
| `docs/01-pruefbericht.md` | **Audit des Prototyps V8.1** – technische Fehler, rechtliche Prüfpunkte (GenG), EU-AI-Act- und DSGVO-Check (Stand Juni 2026) |
| `docs/02-roadmap.md` | **Zielarchitektur & Roadmap** – wie der Prototyp aufs nächste Level kommt (Backend, Mandantenfähigkeit, revisionssichere Ablage, echte Dokumente) |
| `docs/03-remotion-konzept.md` | **Visuelles Konzept mit Remotion** – animierte Erklär-Kompositionen, Player-Einbindung, Abgrenzung zu UI-Animationen |
| `prototyp/BeschlussGenerator_Prototyp_v8.1.html` | Original-Prototyp (Single-File-HTML, Arbeitsstand) |

## Status

- ✅ Prototyp V8.1 fachlich/technisch auditiert (siehe Prüfbericht)
- ⚠️ **Kritisch:** Die KI-Anbindung des Prototyps ist funktionsunfähig (fehlende API-Header) und das referenzierte Modell `claude-sonnet-4-20250514` wird am **15.06.2026 abgeschaltet** → Fix in Phase 1 der Roadmap
- 🔜 Nächster Schritt: Phase 1 der Roadmap (sicherer API-Proxy + Quick-Fixes)

## Verwandte Repos / Quellen

- `kibuddy/genossenschaften-experte-2026` – Wissensbasis & Checklisten (GenG-Fachwissen)
- `kibuddy/chiefmind-fuer-genossenschaften` – Compliance-Notizen (u. a. EU AI Act)
- Businessplan GenoPilot AI (Juni 2026) & Konzept-Pitchdeck „Die KI-gestützte Verwaltungsplattform für Genossenschaften"

---
*Dieses Projekt erstellt Entwürfe zur Arbeitserleichterung und ersetzt keine Rechts-, Steuer- oder Finanzberatung.*
