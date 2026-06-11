// Tests der geng-engine — ausführen mit:  node --test phase-2/packages/geng-engine/
import { test } from "node:test";
import assert from "node:assert/strict";
import { REGELN, regelById, resolve, expectedOrgan, validateProfile, artFuer, kreisVon } from "./engine.mjs";

const basisProfil = {
  mitglieder: 12, vorstand: 1, anteil: 250,
  ar: false, weisung: false, umlauf: true, digital: false, investMitglieder: false,
  invest: 10000, darlehen: null, dauer: 12000,
  quorum: 3, maj: "0,75", kat: ["grundstueck", "vertrag_bedeutung", "prokura"],
};

test("Wissensbasis: 19 Regeln mit Pflichtfeldern", () => {
  assert.equal(REGELN.length, 19);
  for (const r of REGELN) {
    assert.ok(r.id && r.typ && r.label, `Regel ${r.id} unvollständig`);
    assert.ok(Array.isArray(r.geng) && r.geng.length > 0, `Regel ${r.typ}: GenG-Fundstelle fehlt`);
    assert.ok(r.warum && r.satz && r.eskTxt, `Regel ${r.typ}: Erklärtexte fehlen`);
  }
});

test("AR-Fix (Regression Befund A4): Aufsichtsrat → AR-Beschluss + Zählkreis AR", () => {
  const profilMitAR = { ...basisProfil, mitglieder: 25, ar: true };
  // Investition über der Schwelle → bei vorhandenem AR ist der AR zuständig
  const res = resolve(regelById(5), 15000, profilMitAR);
  assert.equal(res.noetig, true);
  assert.equal(res.organ, "Aufsichtsrat");
  assert.equal(res.art, "AR-Beschluss");            // vorher fälschlich "GV-Beschluss"
  assert.equal(kreisVon(res.organ), "AR");           // vorher fälschlich "V"
});

test("Ohne AR fällt die Zuständigkeit auf die Generalversammlung zurück", () => {
  const res = resolve(regelById(5), 15000, basisProfil);
  assert.equal(res.organ, "Generalversammlung");
  assert.equal(res.art, "GV-Beschluss");
  assert.equal(kreisVon(res.organ), "GV");
});

test("Betrag unter der Satzungsgrenze → Geschäftsführung, kein Beschluss", () => {
  const res = resolve(regelById(5), 5000, basisProfil);
  assert.equal(res.noetig, false);
  assert.equal(res.organ, "Vorstand");
  assert.equal(kreisVon(res.organ), "V");
});

test("Keine Satzungsgrenze hinterlegt → Vorstand entscheidet, Aktenvermerk", () => {
  const res = resolve(regelById(7), 50000, { ...basisProfil, darlehen: null });
  assert.equal(res.noetig, false);
  assert.match(res.note, /keine Betragsgrenze/);
});

test("Zustimmungskatalog-Treffer erzwingt Zustimmung", () => {
  const res = resolve(regelById(13), null, basisProfil); // Prokura ist im kat
  assert.equal(res.noetig, true);
  assert.equal(res.organ, "Generalversammlung"); // kein AR im Basisprofil
});

test("Satzungsänderung: zwingend GV mit ¾-Mehrheit", () => {
  const res = resolve(regelById(15), null, basisProfil);
  assert.equal(res.organ, "Generalversammlung");
  assert.equal(res.tor, 1);
  assert.equal(res.maj, "0,75");
});

test("expectedOrgan: Ausschluss (satzungsabhängig) → Default GV", () => {
  assert.equal(expectedOrgan(regelById(4), basisProfil), "Generalversammlung");
});

test("artFuer deckt alle drei Organe ab", () => {
  assert.equal(artFuer("Vorstand"), "Vorstandsbeschluss");
  assert.equal(artFuer("Generalversammlung"), "GV-Beschluss");
  assert.equal(artFuer("Aufsichtsrat"), "AR-Beschluss");
});

test("validateProfile: >20 Mitglieder ohne AR → Warnung (§ 9 GenG)", () => {
  const v = validateProfile({ ...basisProfil, mitglieder: 25 });
  assert.ok(v.warnings.some((w) => w.feld === "ar"));
});

test("validateProfile: 0 Mitglieder → Fehler, Vorstand > Mitglieder → Warnung", () => {
  const v0 = validateProfile({ ...basisProfil, mitglieder: 0 });
  assert.ok(v0.errors.some((e) => e.feld === "mitglieder"));
  const v2 = validateProfile({ ...basisProfil, mitglieder: 3, vorstand: 5 });
  assert.ok(v2.warnings.some((w) => w.feld === "vorstand"));
});

test("validateProfile: Weisungsrecht bei >20 Mitgliedern → Warnung (§ 27 Abs. 2 GenG)", () => {
  const v = validateProfile({ ...basisProfil, mitglieder: 30, ar: true, weisung: true });
  assert.ok(v.warnings.some((w) => w.feld === "weisung"));
});
