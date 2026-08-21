# Master-Bauplan: Beschlussgenerator eG

**Version:** 1.1  
**Stand:** 21.08.2026  
**Status:** Ready for Grok Build / Phase 2  
**Autor:** Grok + Marek Schilke (GenoHeld / Genolution / ChiefMind)  
**Basis:** Audit V8.1/V8.2, geng-engine 2026-06, GenG Stand 2026, Resolvio-Wettbewerbsanalyse, Genossenschafts-Experte-Skill

> **Positionierung**  
> Unterstützendes Werkzeug für Vorstände und Organe von Genossenschaften (eG / SCE).  
> Deterministische Rechtslogik (GenG + Satzung) im Code – KI formuliert nur.  
> **Keine Rechtsberatung.** Verantwortung bleibt beim Vorstand.  
> Ziel: Das absolute Nonplusultra und Profi-Tool für alle Genossenschaften in DACH.

---

## 1. Produktvision & Ziele

### Vision
Der Beschlussgenerator wird das Standard-Werkzeug für rechtssichere, satzungsspezifische und förderzweck-orientierte Beschlüsse in deutschen Genossenschaften.  
Er kombiniert:
- deterministische GenG-Regel-Engine,
- KI-gestützte Formulierung mit Qualitätskontrolle,
- revisionssichere Archivierung,
- vollständigen Beschluss-Lebenszyklus (inkl. Umlauf),
- AI-Act- und DSGVO-Compliance ab Tag 1.

### Primäre Zielgruppe
- Ehrenamtliche und hauptamtliche Vorstände kleiner und mittlerer eGs (Wohnen, Energie, Regional, Kultur, Asset Protection)
- Aufsichtsräte
- Gründungsberatung / Prüfungsverbände (als Empfehlungstool)

### Nicht-Ziele (bewusst)
- Kein eigenes Rechts-LLM, das Rechtsfragen bewertet
- Keine automatische Beschlussfassung ohne menschliche Freigabe
- Kein Ersatz für Prüfungsverband oder Anwalt
- Kein generisches Board-Portal für GmbH/AG (Fokus eG)
- Kein Feature-Ausbau vor Mandantenfähigkeit + Security

---

## 2. Kernfunktionen (MVP → Full)

### Phase 1 (bereits umgesetzt – V8.2)
- [x] eG-Profil (Satzungswerte, Schwellen, Organe)
- [x] Deterministische Regel-Engine (19 Vorgangsarten)
- [x] Zuständigkeit (Vorstand / AR / GV), Mehrheit, Eskalation, Stimmverbot
- [x] KI-Formulierung über EU-Proxy (claude-opus-4-8 + Structured Outputs)
- [x] Qualitätscheck (Zahlen, Platzhalter)
- [x] XSS-sicher, AR-Zählkreis, localStorage-Profil
- [x] Download Entwurf

### Phase 2 – Mandantenfähig & revisionssicher (nächster Build-Fokus)
- [ ] Next.js + Supabase (EU-Region)
- [ ] Auth (Magic-Link / E-Mail)
- [ ] Row-Level-Security (Mandantentrennung je eG)
- [ ] Serverseitige Beschlussnummern (V / GV / AR je Jahr, transaktional)
- [ ] Beschluss-Lebenszyklus: Entwurf → in Abstimmung → final → archiviert
- [ ] Audit-Log mit Hash-Kette
- [ ] Echte DOCX + PDF/A-Erzeugung
- [ ] geng-engine als gemeinsames Paket (UI + Backend)
- [ ] Juristische Abnahme der Wissensbasis (review_status = freigegeben)

### Phase 3 – Compliance & Vertrauen (parallel, Stichtag 02.08.2026)
- [ ] AI-Act-Assessment (final)
- [ ] DSFA + AVV/DPA Anthropic
- [ ] Maschinenlesbare KI-Kennzeichnung
- [ ] Security-Audit / Pentest vorbereiten

### Phase 4 – Plattform-Integration
- [ ] Mitgliederverwaltung (Stimmverbote gegen Mitgliederliste)
- [ ] Versammlungsmodul (TOP → Beschluss → Protokoll → Ergebnis)
- [ ] Qualifizierte E-Signatur (QES)
- [ ] Remotion-Erklärvideos (K1–K5) im Onboarding
- [ ] Umlaufbeschluss-Workflow (Fristen, Erinnerungen, mobile Abstimmung)

---

## 3. Technische Architektur (Ziel)

```
Browser (Next.js + Remotion Player)
    ↓ HTTPS
Supabase (EU)
  ├── Auth (Magic-Link)
  ├── Postgres + RLS
  │     ├── eg_profile
  │     ├── beschluesse (Versionen + Status)
  │     ├── beschluss_nummern (transaktional)
  │     └── audit_log (Hash-Kette)
  ├── Edge Function: ki-formulierung
  │     └── Anthropic claude-opus-4-8 (Structured Outputs, serverseitiger Key)
  └── Storage (DOCX/PDF)

@genopilot/geng-engine (versioniertes Paket)
  ├── regeln.json (Wissensbasis)
  ├── resolve() / validateProfile() / artFuer()
  └── Tests
```

**Leitprinzipien**
1. Deterministische Rechtslogik bleibt im Code – KI formuliert nur.
2. Kein API-Key und keine Mitgliederdaten im Browser.
3. Jede Phase liefert etwas Nutzbares für 3–5 Pilot-eGs.

---

## 4. Regel-Engine (geng-engine) – Abgleich GenG 2026

**Aktueller Stand:** 19 Vorgangsarten, Version 2026-06, 12/12 Tests grün, review_status = offen.

### Offene juristische Punkte (konkret markiert am 21.08.2026)

Die Punkte sind jetzt strukturiert in `regeln.json` unter `meta.offene_review_punkte` und als `pruefhinweis` bei den betroffenen Regeln hinterlegt:

| ID | Thema | Betroffene Regeln | Status |
|----|-------|-------------------|--------|
| C1 | § 16 GenG – Satzungsänderung Mehrheiten (¾ vs. 9/10) | 15 | offen |
| C2 | Stimmverbot bei Interessenkonflikt (§ 43 Abs. 6) | 9, 14 | offen |
| C3 | Vorstandsvergütung – zuständiges Organ (GV vs. AR) | 14 | offen |
| C4 | Förderzweck-Bezug (§ 1 GenG) | 5, 17, 18, 19 | offen |
| C5 | Mehrstimmrechte (§ 43 Abs. 3) – noch nicht abgebildet | – | offen – Erweiterung |

**Pflegeprozess:** Änderungen nur in `regeln.json` + Quellenangabe + Version bump. Nach Abnahme `review_status` aktualisieren und betroffene `pruefhinweis` / Einträge in `offene_review_punkte` entfernen bzw. auf „freigegeben“ setzen.

### Empfohlene Erweiterungen (Phase 2+)
- Prokura / Handlungsvollmacht (§ 42)
- Vorläufige Amtsenthebung (§ 40)
- Fortsetzung nach Auflösung (§ 79a)
- Vertreterversammlung (§ 43a)
- Explizite Unterstützung virtueller / hybrider Formen (§ 43b + BEG IV)

---

## 5. Wettbewerbs-Positionierung (Resolvio & Co.)

**Resolvio** ist der stärkste generische Player (Umlauf, Vorlagen, QES, eG/SCE unterstützt).  
**Unsere Überlegenheit:**
- Echte GenG- + satzungsspezifische Regel-Engine (nicht nur Metadaten)
- Förderzweck-Check und Prüfverbands-Eskalation
- KI-Formulierung mit Qualitätskontrolle speziell für eG-Sprache
- Ehrenamtstaugliche UX + Remotion-Visualisierung des Entscheidungswegs
- Vollständige AI-Act-Compliance von Anfang an

**Übernehmen von Resolvio:**
- Vollständiger Lebenszyklus inkl. Umlauf + Fristen
- Vorlagen-Bibliothek mit Metadaten
- Mobile Abstimmung + revisionssichere Dokumentation
- QES-Vorbereitung

---

## 6. Compliance-Paket (Phase 3 – kritisch)

| Thema              | Stichtag / Status          | Deliverable                     |
|--------------------|----------------------------|---------------------------------|
| AI Act Art. 50     | 02.08.2026                 | Assessment + Transparenztexte   |
| DSGVO / AVV        | sofort                     | AVV Anthropic + DSFA            |
| GenG-Abnahme       | vor Pilot                  | review_status = freigegeben     |
| Security           | vor öffentlichem Pilot     | Pentest-Budget einplanen        |

Einstufung: **Kein Hochrisiko-System** (nur Entwürfe, Human Oversight, keine Entscheidung über Personen).

---

## 7. Datenmodell (Kern – Phase 2)

- `eg` / `eg_profile` (Satzungswerte, Schwellen, Organe, Mehrstimmrechte)
- `beschluesse` (Entwurf, Versionen, Status, Organ, Nummer, Hash)
- `beschluss_nummern` (transaktionale Vergabe V/GV/AR je Jahr)
- `audit_log` (Hash-Kette)
- RLS: strikt je eG

---

## 8. UI/UX & Remotion

- Theme: Dark Blue `#0d1b2a` + Gold `#c9a84c`
- K1 „Der Weg Ihres Beschlusses“ (höchste Priorität – Vertrauen)
- K2 Onboarding (3 Minuten zum sauberen Beschluss)
- K3 „Was die KI tut – und was nicht“ (AI-Act-Transparenz)
- K4 Lebenszyklus-Animation
- K5 Pitch/Marketing

---

## 9. Priorisierte Deliverables für Grok Build (nächste 4–6 Wochen)

1. **Supabase-Projekt (EU)** anlegen + Migration 0001 deployen
2. Next.js-Skeleton + Auth + RLS
3. geng-engine als shared package einbinden
4. Serverseitige Nummernvergabe + Audit-Hash
5. Beschluss-Lebenszyklus (Statusmaschine)
6. DOCX/PDF-Export
7. Juristische Review-Liste der 19 Regeln finalisieren (Abnahme beauftragen)
8. Umlauf-Grundgerüst (mindestens Fristen + Status)

---

## 10. Offene Entscheidungen / Klärungsbedarf

- Juristische Abnahme: Welcher Prüfungsverband / Anwalt?
- Pricing-Modell für Pilot vs. Produktiv?
- QES-Anbieter-Auswahl (Phase 4)
- Ob eigener Repo-Split (`Beschlussgenerator-eG`) jetzt oder später

---

## 11. Nächste Schritte

1. [x] Dieser Master-Bauplan wird als Single Source of Truth behandelt.
2. [x] Offene GenG-Punkte in `regeln.json` markieren und Review beauftragen. *(erledigt 21.08.2026)*
3. [ ] Phase-2-Backlog in Issues / Linear / Notion anlegen.
4. [ ] Grok Build Session für Next.js + Supabase starten.

---

*Dieses Dokument ersetzt die fragmentierten Einzel-Docs und dient als verbindlicher Bauplan für die weitere Entwicklung. Änderungen werden versioniert und hier dokumentiert.*

**Changelog**  
- 1.1 (21.08.2026): Schritt 1 erledigt – offene GenG-Review-Punkte strukturiert in `regeln.json` und README markiert.  
- 1.0 (21.08.2026): Erstversion – konsolidiert aus Audit, Roadmap, Regel-Engine, GenG-Check und Resolvio-Analyse.
