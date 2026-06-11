# @genopilot/geng-engine

Deterministische Regel-Engine des Beschluss-Generators, extrahiert aus Prototyp V8.2 – DOM-frei, damit sie identisch im Browser-UI, in der Next.js-App und in der Beschluss-Prüfung läuft.

- **`regeln.json`** – die fachliche Wissensbasis (19 Vorgangsarten mit GenG-Fundstellen, Erklär- und Eskalationstexten). Versioniert über `meta.version`; `meta.review_status` dokumentiert den Stand der juristischen Abnahme. Regeln mit offenem Prüfauftrag aus dem Audit tragen ein `pruefhinweis`-Feld (derzeit: Satzungsänderung/§ 16, Stimmverbote/§ 43 Abs. 6).
- **`engine.mjs`** – `resolve()` (Zuständigkeit/Beschlussart), `validateProfile()` (Plausibilität nach § 4/§ 9/§ 24/§ 27 GenG), `artFuer()`/`kreisVon()` (Beschlussart & Nummern-Zählkreis je Organ, inkl. AR-Fix aus dem Audit).
- **`engine.test.mjs`** – Regressionstests, u. a. für den Aufsichtsrats-Bug (Befund A4).

```bash
node --test phase-2/packages/geng-engine/engine.test.mjs
```

**Pflegeprozess:** Änderungen an Regeltexten nur in `regeln.json` (nie im UI-Code), mit Quellenangabe im Commit und angepasster `meta.version`. Nach juristischer Abnahme `review_status` aktualisieren und betroffene `pruefhinweis`-Felder entfernen.

Hinweis: Der Prototyp V8.2 trägt dieselbe Logik noch inline (Single-File-Vorgabe). Diese Extraktion ist die Referenz für die Next.js-App in Phase 2; beim Umbau wird das HTML auf die Engine umgestellt.
