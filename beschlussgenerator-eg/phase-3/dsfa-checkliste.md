# DSFA-Prüfung (Art. 35 DSGVO): Beschluss-Generator

**Version:** 0.9 (Entwurf) · **Stand:** 11.06.2026

## Schritt 1 – Schwellwertprüfung: Ist eine DSFA erforderlich?

| Kriterium (u. a. DSK-Liste / Art. 35 Abs. 3) | Einschätzung |
|---|---|
| Systematische umfassende Bewertung persönlicher Aspekte (Profiling/Scoring)? | **Nein** – das System bewertet Vorgänge, nicht Personen |
| Umfangreiche Verarbeitung besonderer Kategorien (Art. 9)? | **Nein**, aktiv entgegengewirkt (Warnhinweis, Pseudonymisierung); Resteintrag durch Nutzer möglich |
| Systematische Überwachung? | Nein |
| Neue Technologie mit erhöhtem Risiko (KI-Verarbeitung personenbezogener Freitexte) | **Ja, teilweise** – KI-Formulierung von Nutzereingaben |
| Daten schutzbedürftiger Personen in großem Umfang? | Nein (Vorstands-/Mitgliedsbezüge in Einzelfällen) |

**Vorläufiges Ergebnis:** DSFA nicht zwingend, aber wegen KI-Einsatz **freiwillige Kurz-DSFA empfohlen** (dieses Dokument ausfüllen). Ergebnis dokumentieren – auch ein „nicht erforderlich" ist nachzuweisen.

## Schritt 2 – Beschreibung der Verarbeitung

- **Datenflüsse:** Browser → EU-Proxy (Supabase Edge Function, EU-Region) → Anthropic API (USA; AVV/DPA, SCC/Data-Privacy-Framework). Keine Trainingsnutzung der API-Daten lt. Anbieter-Vertrag.
- **Datenarten:** Stichpunkte zu Beschlussvorgängen (i. d. R. Sachdaten); potenziell Namen von Organmitgliedern → Pseudonymisierung vor Versand (Best-Effort-Erkennung + Nutzerbestätigung).
- **Speicherung:** Phase 1: keine serverseitige Speicherung der Prompts; Phase 2: Beschlüsse in Supabase (EU) mit RLS-Mandantentrennung, Audit-Log.

## Schritt 3 – Risiken & Abhilfen

| Risiko | Abhilfe |
|---|---|
| Klarnamen/Art.-9-Daten gelangen in den Prompt | Pseudonymisierungs-Dialog, Warnhinweise, Schulung (Art. 4 AI Act); Datenminimierung als Default |
| Drittlandtransfer USA | AVV/DPA + SCC/DPF dokumentieren (→ `avv-checkliste.md`); Alternative EU-Inferenz-Endpunkte beobachten |
| Unbefugter Zugriff (Mehrmandanten) | RLS, Auth, CORS-Restriktion, Pentest vor Go-Live (Budget im Businessplan) |
| Key-/Konfigurationsleck | API-Key nur als Server-Secret (Fix A1), Secret-Rotation |

## Schritt 4 – Ergebnis & Abnahme

- [ ] Kurz-DSFA durchgeführt, Restrisiko akzeptabel
- [ ] Verarbeitungsverzeichnis ergänzt (Verarbeitung „KI-gestützte Beschlussformulierung")
- [ ] Datenschutzerklärung angepasst (KI-Einsatz, Drittland, localStorage)
- [ ] Abnahme Datenschutz-Verantwortliche/r: ______________ Datum: ________
