# AI-Act-Assessment: Beschluss-Generator (GenoPilot AI)

**Version:** 0.9 (Entwurf zur fachlichen Abnahme) · **Stand:** 11.06.2026 · **Stichtag Art. 50:** 02.08.2026

> Internes Dokument nach Art. 4, 50 ff. Verordnung (EU) 2024/1689 („EU AI Act"). Kein Rechtsgutachten – vor Pilotbetrieb durch Rechtsberatung bestätigen lassen (Unterschriftenfeld unten).

## 1. Systembeschreibung und Zweckbestimmung

Der Beschluss-Generator unterstützt Vorstände, Aufsichtsräte und Generalversammlungen kleiner Genossenschaften (eG) beim **Entwerfen und formalen Prüfen von Beschlüssen**:

- Eine **deterministische Regel-Engine** (kein ML) ordnet den Vorgang nach GenG/Satzungsangaben ein (zuständiges Organ, Beschlussart, Mehrheit, Eskalationsempfehlung).
- Ein **KI-Sprachmodell** (Anthropic Claude, Zugriff über serverseitigen EU-Proxy) formuliert aus Stichpunkten des Nutzers Textbausteine (Überschrift, Begründung, Förderzweck-Bezug). Es trifft **keine** rechtliche Bewertung; das ist per System-Prompt untersagt und durch den deterministischen Aufbau abgesichert.
- Jeder Entwurf erfordert **menschliche Prüfung und Freigabe** (Mensch-in-der-Schleife); das Dokument ist als KI-gestützter Entwurf gekennzeichnet.

## 2. Rollen nach AI Act

| Rolle | Wer | Begründung |
|---|---|---|
| Anbieter des KI-Modells (GPAI) | Anthropic | Modellanbieter; GPAI-Pflichten (Kap. V) liegen dort |
| **Betreiber/Anbieter des KI-Systems** | GenoPilot eG (i. Gr.) | Integration des Modells in ein eigenes System unter eigenem Namen → Pflichten aus Art. 50 Abs. 1, 2 und 4 i. V. m. der Bereitstellung an Kunden |
| Nutzer (Deployer) | Kunden-Genossenschaften | Verwenden die Entwürfe in eigener Verantwortung |

## 3. Risikoeinstufung

**Ergebnis: kein Hochrisiko-System** nach Art. 6 i. V. m. Annex III (geprüft am 11.06.2026):

- Keine Rechtspflege/Justizverwaltung i. S. v. Annex III Nr. 8 (das System unterstützt private Organe bei Entwürfen; es entscheidet nicht und unterstützt keine Justizbehörde).
- Keine Entscheidungen über natürliche Personen (Beschäftigung, Kreditwürdigkeit, wesentliche Dienste etc.).
- Kein verbotenes System nach Art. 5.
- Einstufung damit: **KI-System mit begrenztem Risiko** → Transparenzpflichten nach Art. 50.

**Re-Klassifizierungs-Trigger (bei Produkterweiterung neu prüfen!):** Module, die Entscheidungen über Personen vorbereiten oder bewerten – z. B. Ausschluss-Empfehlungen zu konkreten Mitgliedern, Bonitäts-/Risikobewertungen, automatisierte Fristen-Sanktionen.

## 4. Pflichten und Maßnahmen

| Pflicht | Frist | Maßnahme im Produkt | Status |
|---|---|---|---|
| Art. 50 Abs. 1 (Interaktion mit KI offenlegen) | 02.08.2026 | „KI-gestützt"-Badge, Hinweisbox vor der Generierung | ✅ in V8.2 |
| Art. 50 (KI-generierte/-gestützte Texte kennzeichnen) | 02.08.2026 | Kopfzeile „ENTWURF — KI-GESTÜTZT FORMULIERT … menschlich zu prüfen" in jedem Download; `ki_formuliert`-Flag in der DB (Phase 2) | ✅ / Phase 2 |
| Art. 50 Abs. 2 (maschinenlesbare Kennzeichnung) | Termin im Trilog (Nov. 2026 / Feb. 2027) | Meta-Tags `ai-generated`, `ai-human-reviewed`, `content-sha256` als Vorleistung; Umstellung auf finales EU-Format (voraussichtl. C2PA-nah), sobald Code of Practice vorliegt | 🔶 beobachten |
| Art. 4 (KI-Kompetenz) | seit 02.02.2025 | Onboarding-Material „Was kann das Tool, was nicht" (Remotion-Clip K3), interne Schulungsnotiz für Support | 🔶 offen |
| Dokumentation der Einstufung | laufend | dieses Assessment, Review bei jedem neuen Modul | ✅ mit Abnahme |

**Hinweis Digital Omnibus (vorläufige Trilog-Einigung Mai 2026):** Verschiebungen betreffen Hochrisiko-Pflichten (Dez. 2027/Aug. 2028) – für dieses System ohne Auswirkung; Art.-50-Stichtag 02.08.2026 bleibt.

## 5. Restrisiken

- Fehlformulierungen der KI → abgefangen durch Qualitätscheck (Zahlen-Diff, Platzhalter), Pflicht zur menschlichen Prüfung, Empfehlung externer Bestätigung (Anwalt/Prüfungsverband) bei „roten" Vorgängen.
- Übersteigertes Vertrauen der Nutzer („Automation Bias") → Disclaimer, Eskalationshinweise je Vorgangsart, Schulungsmaterial (Art. 4).

## 6. Abnahme

| Rolle | Name | Datum | Unterschrift |
|---|---|---|---|
| Fachlich (Vorstand GenoPilot) | | | |
| Rechtlich (Kanzlei/Prüfungsverband) | | | |

*Wiedervorlage: bei jedem neuen Modul, spätestens 01.08.2026 (Stichtags-Check) und nach Abschluss des Digital-Omnibus-Trilogs.*
