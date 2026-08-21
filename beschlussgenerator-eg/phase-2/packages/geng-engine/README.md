# @genopilot/geng-engine

Deterministische Regel-Engine des Beschluss-Generators, extrahiert aus Prototyp V8.2 – DOM-frei, damit sie identisch im Browser-UI, in der Next.js-App und in der Beschluss-Prüfung läuft.

- **`regeln.json`** – die fachliche Wissensbasis (19 Vorgangsarten mit GenG-Fundstellen, Erklär- und Eskalationstexten).  
  Versioniert über `meta.version`.  
  `meta.review_status` + `meta.offene_review_punkte` dokumentieren den Stand der juristischen Abnahme (Stand 21.08.2026 – Schritt 1 Master-Bauplan).  
  Regeln mit offenem Prüfauftrag tragen ein `pruefhinweis`-Feld (aktuell: C1 § 16 Mehrheiten, C2 Stimmverbot, C3 Vergütung, C4 Förderzweck, C5 Mehrstimmrechte).
- **`engine.mjs`** – `resolve()` (Zuständigkeit/Beschlussart), `validateProfile()` (Plausibilität nach § 4/§ 9/§ 24/§ 27 GenG), `artFuer()`/`kreisVon()` (Beschlussart & Nummern-Zählkreis je Organ, inkl. AR-Fix aus dem Audit).
- **`engine.test.mjs`** – Regressionstests, u. a. für den Aufsichtsrats-Bug (Befund A4).

```bash
node --test phase-2/packages/geng-engine/engine.test.mjs
```

**Pflegeprozess:** Änderungen an Regeltexten nur in `regeln.json` (nie im UI-Code), mit Quellenangabe im Commit und angepasster `meta.version`. Nach juristischer Abnahme `review_status` aktualisieren und betroffene `pruefhinweis`-Felder sowie Einträge in `offene_review_punkte` entfernen bzw. auf „freigegeben“ setzen.

Hinweis: Der Prototyp V8.2 trägt dieselbe Logik noch inline (Single-File-Vorgabe). Diese Extraktion ist die Referenz für die Next.js-App in Phase 2; beim Umbau wird das HTML auf die Engine umgestellt.

Siehe auch: `docs/00-MASTER-BAUPLAN.md` und `docs/01-pruefbericht.md`.
