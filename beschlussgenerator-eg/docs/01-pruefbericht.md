# Prüfbericht: Beschluss-Generator Prototyp V8.1

**Stand: 11.06.2026 · Geprüfte Unterlagen:** Prototyp `BeschlussGenerator_Prototyp_v81.html` (847 Zeilen), Businessplan GenoPilot AI (V1.0, Juni 2026), Konzept-Pitchdeck (174 Seiten), Wissensbasis & Checklisten in den beiden GitHub-Repos.

## Gesamturteil

Der Prototyp ist fachlich **deutlich besser als ein typischer V1-Prototyp**: Die deterministische Regel-Engine (19 Vorgangsarten mit GenG-Fundstellen, Schwellenwert-Logik, Zustimmungskatalog, Stimmverbots- und Eskalationshinweisen), die Eingabe-Plausibilisierung (§ 4, § 9, § 27 GenG), der KI-Qualitätscheck (Zahlen-Abgleich gegen die Eingabe) und die Pseudonymisierung vor dem KI-Aufruf sind durchdachte, richtige Designentscheidungen. Die Trennung „deterministische Rechtslogik im Code, KI nur für Formulierung" ist genau die richtige Architektur für ein Produkt mit Haftungsbezug.

**Aber:** Die KI-Anbindung ist in der vorliegenden Form funktionsunfähig und dürfte aus Sicherheits- und Datenschutzgründen so auch nie produktiv gehen. Außerdem gibt es eine Handvoll echter Bugs und einige rechtliche Präzisierungen.

---

## A. Kritische Befunde (müssen vor jedem Pilot-Einsatz behoben werden)

### A1. Der KI-Aufruf kann technisch nie funktionieren
`optimizeText()` ruft `https://api.anthropic.com/v1/messages` direkt aus dem Browser auf – **ohne die Pflicht-Header** `x-api-key` und `anthropic-version: 2023-06-01`. Jeder Aufruf endet mit HTTP 401. Der Fallback („Eingaben als Rohtext übernommen") greift also immer; die „KI-Formulierung" lief vermutlich noch nie über diesen Codepfad.

Wichtiger als der Fix: **Der API-Key gehört niemals in den Browser.** Jeder Nutzer könnte ihn aus dem Quelltext auslesen und auf fremde Rechnung Anfragen stellen. Lösung: schlanker Server-Proxy (z. B. Supabase Edge Function in einer EU-Region), der den Key serverseitig hält – Details in `02-roadmap.md`.

### A2. Veraltetes Modell – Abschaltung am 15.06.2026
Der Prototyp referenziert `claude-sonnet-4-20250514`. Dieses Modell ist deprecated und wird **am 15.06.2026 abgeschaltet** (vier Tage nach diesem Bericht). Empfehlung: aktuelles Modell `claude-opus-4-8` (beste Qualität für deutsche Verwaltungs-/Beschlusssprache; Kostenrahmen des Businessplans von ~1,50–1,70 €/Premium-Kunde/Monat bleibt bei realistischer Nutzung haltbar). Zusätzlich sollte die Antwort über **Structured Outputs** (`output_config.format` mit JSON-Schema) erzwungen werden, statt die JSON-Antwort per Regex von Markdown-Backticks zu befreien und auf gut Glück zu parsen.

### A3. XSS-Lücke in der Entwurfs-Anzeige
`renderDoc()` schreibt den Dokumenttext per `innerHTML` in die Seite, ohne Nutzereingaben zu escapen (nur der Download-Pfad escapet). Eingaben wie `<img src=x onerror=...>` im Titel-/Sachverhaltsfeld werden ausgeführt. Im Single-User-Prototyp „nur" Self-XSS – in der geplanten Mehrbenutzer-SaaS (geteilte Beschlüsse, Mitgliederportal) eine ernste Lücke. Fix: vor dem Einfügen escapen (wie in `downloadDoc()` bereits vorhanden), Platzhalter-Markierung erst danach anwenden.

### A4. Inkonsistenz bei Aufsichtsrats-Zuständigkeit
In `resolve()` (Zustimmungskatalog-Treffer und Schwellenüberschreitung) wird das Organ korrekt zu „Aufsichtsrat" aufgelöst, wenn ein AR existiert – die Beschlussart bleibt aber hart codiert **„GV-Beschluss"**, und der Nummernkreis (`kreisVon`) kennt nur „V" und „GV". Folgen: AR-Beschlüsse werden falsch betitelt und im falschen Zählkreis nummeriert. Fix: dritte Beschlussart „AR-Beschluss" + Zählkreis „AR".

---

## B. Technische Befunde (wichtig, nicht blockierend)

| # | Befund | Empfehlung |
|---|---|---|
| B1 | **Beschlussnummern in `localStorage`**: pro Browser/Gerät eigener Zähler → Kollisionen bei zwei Geräten, Verlust beim Cache-Löschen. Für lückenlose Nummerierung (Beweiszweck!) ungeeignet. | Serverseitige, transaktionale Vergabe pro eG und Zählkreis (Phase 2). |
| B2 | **eG-Profil wird nicht gespeichert** – nach jedem Reload sind Satzung-Schwellen, Förderzweck etc. weg. | Kurzfristig `localStorage`, mittelfristig Nutzerkonto/DB. |
| B3 | **„.doc"-Download ist ein HTML-Blob** mit `application/msword`-MIME-Typ. Word öffnet das mit Kompatibilitätswarnung; kein echtes Format. | Echte DOCX-Erzeugung (z. B. `docx`-Bibliothek) und PDF/A für die revisionssichere Ablage (Phase 2). |
| B4 | **Namens-Erkennung (Pseudonymisierung) ist Regex-basiert** („zwei großgeschriebene Wörter") – viele False Positives (z. B. „Region Bayern") und False Negatives (einzelne Vornamen, Kleinschreibung). Als Hinweis-Mechanik gut, als Datenschutz-Garantie ungeeignet. | Beibehaltung als „Best-Effort"-Warnung mit ehrlichem Wording (ist schon so formuliert ✓); optional später NER serverseitig. |
| B5 | **SHA-256-Prüfsumme** im Download ist korrekt als „keine Signatur" gekennzeichnet ✓ – aber die Prüfsumme steht im selben Dokument, das sie schützt; wer den Text ändert, ändert die Prüfsumme mit. | Serverseitige Hash-Registrierung (Hash-Kette/Audit-Log) in Phase 2; qualifizierte E-Signatur als Add-on wie im Businessplan geplant. |
| B6 | Sitzungsformat „schriftlich" wird mit der Dokumentvariante „Sitzungsbeschluss" kombinierbar – Formulierungen mischen sich. | Formatwahl und Variantenwahl koppeln. |
| B7 | Keine Barrierefreiheit (fehlende `label`-Zuordnungen, `aria`-Attribute); relevant, da Zielgruppe ehrenamtliche, teils ältere Vorstände. | In der Produktversion WCAG-Basics einplanen. |

**Positiv hervorzuheben (beibehalten!):** KI-Qualitätscheck mit Zahlen-Diff gegen die Eingabe; Platzhalter-Konvention `[…]` mit Anweisung an das Modell, nichts zu erfinden; getrennte Zählkreise V/GV mit Jahresbezug; Verdikt-Logik mit „kein Beschluss nötig → Aktenvermerk"; ehrliche Disclaimer ohne absolute Versprechen (deckt sich mit der Risikostrategie im Businessplan).

---

## C. Rechtliche Prüfpunkte (GenG)

Die Regel-Engine ist insgesamt solide aufgebaut. Folgende Punkte sollten vor dem Pilot mit Prüfungsverband/Anwalt geschärft werden:

| # | Fundstelle im Tool | Prüfpunkt |
|---|---|---|
| C1 | Satzungsänderung: „¾-Mehrheit (§ 16 Abs. 1 GenG)" | Die Zuständigkeit der GV steht in **Abs. 1**; das Mehrheitserfordernis steht in **§ 16 Abs. 2** – und für bestimmte Änderungen (z. B. Nachschusspflicht) gilt eine **9/10-Mehrheit** bzw. strengere Satzungsregeln. Zitat präzisieren, 9/10-Fälle ergänzen. |
| C2 | Stimmverbot bei Vorstandsvergütung/Kredit: „§ 43 Abs. 6 GenG", im Erklärtext „Selbstkontrahieren" | § 43 Abs. 6 GenG regelt Stimmverbote für klar umrissene Fälle (Entlastung, Befreiung von Verbindlichkeiten u. a.). Ob die eigene Vergütung darunter fällt, ist auslegungsbedürftig; „Selbstkontrahieren" ist zudem der Begriff aus **§ 181 BGB**, nicht § 43 GenG. Empfehlung: Hinweis behalten (in der Sache richtig und vorsichtig), Paragraphenzitat juristisch gegenprüfen lassen. |
| C3 | „vgl. § 19 Abs. 2 Mustersatzung" | Eine Mustersatzung ist kein Gesetz – als solche kennzeichnen („Mustersatzung des Verbands X") oder neutral formulieren („viele Satzungen verlangen…"). |
| C4 | Virtuelle/hybride GV: § 43b GenG ✓; Vorstand/AR: Satzungsvorbehalt ✓ | Korrekt differenziert – beibehalten. Ergänzen: Dokumentationspflichten zur technischen Durchführung sind im Entwurfstext bereits angelegt ✓. |
| C5 | Mitgliederdarlehen § 21b GenG mit Nachrangabrede, Kredit an Vorstand § 49 GenG, AR-Verzicht § 9 Abs. 1 GenG (≤ 20 Mitglieder), Weisungsrecht § 27 Abs. 2 GenG (≤ 20), investierende Mitglieder § 8 Abs. 2 GenG | Sachlich plausibel abgebildet; als Gesamtpaket in den geplanten „GenG-Check" (Businessplan, Posten Recht & DSGVO, 6.000 €) aufnehmen und einmalig fachlich abnehmen lassen. |

**Empfehlung:** Die Regeltexte (REGELN-Array) als **versionierte, fachlich abgenommene Wissensbasis** aus dem Code herauslösen (JSON/YAML im Repo, mit Quellen- und Stand-Angabe je Regel). Dann kann der Prüfungsverband die Inhalte reviewen, ohne Code lesen zu müssen – und Änderungen am GenG werden nachvollziehbar gepflegt.

---

## D. EU AI Act – Check gegen den Stand Juni 2026

Der Prototyp referenziert Art. 50 EU AI Act bereits an drei Stellen (Hinweisbox, Dokument-Kopf, maschinenlesbare Meta-Tags). Das ist mehr, als die meisten Wettbewerber heute tun. Abgleich mit dem aktuellen Stand:

1. **Art. 50 (Transparenzpflichten) gilt ab 02.08.2026** – also in ~7 Wochen. Dieser Termin steht fest und wird durch den Digital Omnibus **nicht** verschoben. Der Prototyp-Ansatz (Offenlegung „KI-gestützt formuliert", menschliche Prüfpflicht) trifft die Anforderung der Offenlegungspflicht für KI-generierte/-unterstützte Texte dem Grunde nach. ✓
2. **Digital Omnibus (vorläufige Trilog-Einigung Mai 2026):** verschiebt große Teile der **Hochrisiko-Pflichten** auf Dez. 2027 / Aug. 2028 – für uns nur relevant, falls der Generator je als Hochrisiko eingestuft würde (s. u.). Die **maschinenlesbare Kennzeichnung nach Art. 50 Abs. 2** ist terminlich noch im Trilog (Parlament: 02.11.2026, Kommission: 02.02.2027). Die bereits eingebauten Meta-Tags (`ai-generated`, `content-sha256`) sind eine gute Vorleistung; das finale EU-Format (voraussichtlich C2PA-nahe) muss nachgezogen werden, sobald der Code of Practice steht. Der Kommentar im Code („finales EU-Format folgt 2026") ist korrekt. ✓
3. **Risikoeinstufung dokumentieren:** Der Beschluss-Generator ist nach unserer Einschätzung **kein Hochrisiko-System** (Annex III): keine Rechtspflege im Sinne des Annex, keine Entscheidung über Personen – er erstellt Entwürfe, die ein Mensch verantwortet. Diese Einstufung sollte als kurzes internes **AI-Act-Assessment** schriftlich festgehalten werden (1–2 Seiten: Zweckbestimmung, Einstufung, Begründung, Transparenzmaßnahmen). Achtung Abgrenzung: Sobald Module Entscheidungen über Mitglieder vorbereiten (z. B. Ausschluss-Empfehlungen, Bonität), ist die Einstufung neu zu prüfen.
4. **Art. 4 (KI-Kompetenz, gilt seit Feb. 2025):** Anbieter und Betreiber müssen KI-Kompetenz ihres Personals sicherstellen. Für GenoPilot heißt das praktisch: kurzes Schulungs-/Hinweismaterial für Kunden-Vorstände („Was kann das Tool, was nicht") – passt ohnehin zum Onboarding und zum Remotion-Konzept (Erklärvideos).
5. **Hinweis zur Formulierung im Tool:** „Art. 50 EU AI Act" pauschal als Pflichtgrundlage für den Hinweis zu zitieren, ist leicht ungenau – sauberer: „Transparenz nach Art. 50 EU AI Act (anwendbar ab 02.08.2026)". Sanktionen: bis 15 Mio. € / 3 % Weltumsatz – Compliance lohnt sich.

**Fazit AI Act: Richtung stimmt, Stand ist aktuell.** To-dos: schriftliches Assessment, Formulierung präzisieren, finales Kennzeichnungsformat beobachten.

## E. DSGVO – Check

1. **Kritisch: Direkter Browser-Aufruf an einen US-Anbieter** ohne Auftragsverarbeitungsvertrag, ohne dokumentierte Rechtsgrundlage und mit potenziell personenbezogenen Eingaben ist nicht DSGVO-konform betreibbar. Lösung (Phase 1): **EU-gehosteter Server-Proxy** + **AVV/DPA mit Anthropic** (in den Commercial Terms enthalten; keine Trainingsnutzung der API-Daten; Übermittlung über SCC/Data-Privacy-Framework dokumentieren). Im Verarbeitungsverzeichnis aufnehmen; wegen KI-Verarbeitung von Mitgliederdaten eine **Datenschutz-Folgenabschätzung** zumindest prüfen und das Ergebnis dokumentieren.
2. **Datenminimierung ist vorbildlich angelegt** ✓: Pseudonymisierung vor dem KI-Aufruf, Warnhinweis bei erkannten Klarnamen, ausdrückliche Warnung vor besonderen Kategorien (Art. 9). Beibehalten; Grenzen der Regex-Erkennung ehrlich kommunizieren (siehe B4).
3. **Lokale Schriften statt Google Fonts** ✓ (kein Drittlands-Call beim Laden) – im Code sogar kommentiert. In der Produktversion echte Font-Dateien lokal hosten, wie im Kommentar vorgesehen.
4. **localStorage** (Beschlusszähler) ist unkritisch (keine personenbezogenen Daten), sollte aber in der Datenschutzerklärung der Produktversion erwähnt werden, sobald dort Profil-Daten landen (B2).
5. **Mandantentrennung** ist im Businessplan als Gegenmaßnahme genannt – in der Zielarchitektur konsequent über Row-Level-Security umsetzen (siehe Roadmap), plus EU-Hosting (z. B. Supabase EU-Region, wie im Businessplan als Anbieter angenommen).

## F. Anmerkungen zu Businessplan & Konzept (nur Beschluss-Generator-relevant)

- Die KI-Kostenannahme (1,50–1,70 €/Premium-Kunde/Monat) ist mit aktuellem Modell-Pricing und typischer Nutzung (kurze Prompts, ~1.000 Output-Tokens je Entwurf) weiterhin plausibel – selbst mit dem Top-Modell.
- Der Beschluss-Generator ist laut Pitchdeck Kernbestandteil des Moduls „Beschlüsse" (Erstellen, Unterschreiben, Archivieren, PDF) – die Roadmap in `02-roadmap.md` ist so geschnitten, dass jede Phase direkt auf dieses Modul einzahlt und nichts weggeworfen wird.
- Posten „Recht & DSGVO 6.000 €" und „Security-Audit 9.000 €": Die Befunde A3 (XSS) und C1–C3 (Paragraphen-Präzision) liefern bereits konkrete Prüfaufträge dafür.

---

## Priorisierte Maßnahmenliste

| Prio | Maßnahme | Befund |
|---|---|---|
| 1 | API-Proxy (EU) + Key serverseitig + aktuelles Modell `claude-opus-4-8` + Structured Outputs | A1, A2, E1 |
| 2 | XSS-Fix in `renderDoc()` | A3 |
| 3 | AR-Beschlussart + AR-Zählkreis | A4 |
| 4 | Regeltexte als versionierte Wissensbasis extrahieren, juristische Abnahme (C1–C5) | C |
| 5 | AI-Act-Assessment (1–2 Seiten) schreiben, Transparenztexte präzisieren | D |
| 6 | Profil-Persistenz, serverseitige Beschlussnummern, echte DOCX/PDF | B1–B3 |

*Dieser Bericht ist eine technisch-fachliche Analyse und keine Rechtsberatung. Rechtliche Punkte (Abschnitte C–E) bitte durch Prüfungsverband bzw. Anwalt bestätigen lassen.*
