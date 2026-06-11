// @genopilot/geng-engine — deterministische Regel-Engine des Beschluss-Generators
//
// Extrahiert aus Prototyp V8.2 (DOM-frei, pure Funktionen). Die fachlichen Regeltexte
// liegen versioniert in regeln.json (juristisch abnehmbare Wissensbasis).
// Diese Engine bewertet KEINE Rechtsfragen per KI — sie wendet die hinterlegten,
// geprüften Regeln an. Keine Rechtsberatung.

import { readFileSync } from "node:fs";

const wissensbasis = JSON.parse(readFileSync(new URL("./regeln.json", import.meta.url), "utf8"));
export const META = wissensbasis.meta;
export const REGELN = wissensbasis.regeln;

export function regelById(id) {
  return REGELN.find((r) => r.id === id) || null;
}

/** Beschlussart folgt dem Organ (V8.2-Fix: Aufsichtsrat erhält "AR-Beschluss"). */
export function artFuer(organ) {
  if (organ === "Generalversammlung") return "GV-Beschluss";
  if (organ === "Aufsichtsrat") return "AR-Beschluss";
  return "Vorstandsbeschluss";
}

/** Nummern-Zählkreis je Organ (V8.2-Fix: eigener Kreis "AR"). */
export function kreisVon(organ) {
  if (organ === "Generalversammlung") return "GV";
  if (organ === "Aufsichtsrat") return "AR";
  return "V";
}

/**
 * Kernlogik: Braucht der Vorgang einen Beschluss, und welches Organ ist zuständig?
 * @param {object} regel   Eintrag aus REGELN
 * @param {number|null} betrag  Volumen in €, falls regel.betrag
 * @param {object} profil  { mitglieder, ar, weisung, kat: string[], invest, darlehen, dauer, ... }
 */
export function resolve(regel, betrag, profil) {
  const p = profil;
  if (p.mitglieder == null) return { error: "Mitgliederzahl fehlt im Profil." };
  const orgOrGV = (o) => (o === "Aufsichtsrat" && !p.ar ? "Generalversammlung" : o);
  const maj = regel.maj || null;

  if (regel.zwingend || regel.tor === 1) {
    return { noetig: true, organ: "Generalversammlung", art: "GV-Beschluss", tor: 1, esk: regel.esk, maj };
  }

  const katHit = regel.katKey && Array.isArray(p.kat) && p.kat.includes(regel.katKey);
  if (katHit) {
    const o = orgOrGV("Aufsichtsrat");
    return {
      noetig: true, organ: o, art: artFuer(o), tor: 2,
      esk: regel.esk === "auto" ? "Prüfverband empfohlen" : regel.esk,
      note: "In Ihrem Zustimmungskatalog erfasst → Zustimmung erforderlich.",
    };
  }

  if (regel.betrag) {
    const s = p[regel.schwelle];
    if (s == null) {
      return { noetig: false, organ: "Vorstand", art: "kein Beschluss", tor: 5, esk: "keine",
        note: "Ihre Satzung nennt keine Betragsgrenze — der Vorstand entscheidet eigenverantwortlich. Aktenvermerk empfohlen." };
    }
    if (betrag > s) {
      const o = orgOrGV("Aufsichtsrat");
      return { noetig: true, organ: o, art: artFuer(o), tor: 3,
        esk: regel.esk === "auto" ? "Prüfverband empfohlen" : regel.esk,
        note: `Betrag über Satzungsgrenze (${s.toLocaleString("de-DE")} €) → Zustimmung erforderlich.` };
    }
    return { noetig: false, organ: "Vorstand", art: "kein Beschluss", tor: 5, esk: "keine",
      note: `Innerhalb der Satzungsgrenze (${s.toLocaleString("de-DE")} €) → Geschäftsführung.` };
  }

  if (regel.tor === 2) {
    const o = regel.organ === "satzung" ? "Generalversammlung" : orgOrGV(regel.organ);
    return { noetig: true, organ: o, art: artFuer(o), tor: 2, esk: regel.esk,
      note: regel.organ === "satzung" ? "Zuständiges Organ satzungsabhängig — Default GV angenommen." : null };
  }

  if (p.weisung && p.mitglieder <= 20) {
    return { noetig: false, organ: "Vorstand", art: "kein Beschluss", tor: 5, esk: "keine",
      note: "Reine Geschäftsführung — die GV kann das Geschäft per Weisung an sich ziehen (§ 27 Abs. 2)." };
  }
  return { noetig: false, organ: "Vorstand", art: "kein Beschluss", tor: 5, esk: "keine",
    note: "Reine Geschäftsführung. Bei Gesamtvertretung Aktenvermerk zur Doku empfohlen." };
}

/** Welches Organ wäre im Zweifel (Betrag über jeder Schwelle) zuständig? */
export function expectedOrgan(regel, profil) {
  const res = resolve(regel, regel.betrag ? 9999999 : null, profil);
  return res.error ? "Generalversammlung" : res.noetig ? res.organ : "Vorstand";
}

/**
 * Plausibilitätsprüfung des eG-Profils (portiert aus validateProfile, DOM-frei).
 * @returns {{errors: Array, warnings: Array}} Einträge: { feld, titel, detail }
 */
export function validateProfile(p) {
  const errors = [], warnings = [];
  const err = (feld, titel, detail) => errors.push({ feld, titel, detail });
  const warn = (feld, titel, detail) => warnings.push({ feld, titel, detail });

  if (p.mitglieder == null) err("mitglieder", "Mitgliederzahl fehlt", "Ohne diese Angabe kann die Zuständigkeit nicht bestimmt werden.");
  else if (p.mitglieder < 0) err("mitglieder", "Mitgliederzahl kann nicht negativ sein", "Bitte korrigieren.");
  else if (p.mitglieder === 0) err("mitglieder", "Eine eG ohne Mitglieder gibt es nicht", "Gesetzlich mindestens drei Mitglieder (§ 4 GenG).");
  else if (p.mitglieder < 3) warn("mitglieder", `Nur ${p.mitglieder} Mitglied(er) — eine eG braucht mindestens 3`, "Nach § 4 GenG mindestens drei Mitglieder; dauerhaftes Unterschreiten kann zur Auflösung führen (§ 80 GenG).");

  if (p.mitglieder != null && p.mitglieder > 20 && !p.ar) warn("ar", "Mehr als 20 Mitglieder — Aufsichtsrat ist Pflicht", "Der Verzicht auf einen Aufsichtsrat ist nur bei höchstens 20 Mitgliedern zulässig (§ 9 Abs. 1 GenG).");

  if (p.vorstand == null || p.vorstand < 1) err("vorstand", "Mindestens ein Vorstandsmitglied nötig", "Jede eG braucht einen Vorstand aus mindestens einer Person (§ 24 Abs. 2 S. 3 GenG).");
  else if (p.mitglieder != null && p.mitglieder > 0 && p.vorstand > p.mitglieder) warn("vorstand", "Mehr Vorstandsmitglieder als Mitglieder", "Vorstandsmitglieder müssen zugleich Mitglieder sein (§ 9 Abs. 2 GenG).");

  if (p.anteil != null && p.anteil < 0) err("anteil", "Geschäftsanteil kann nicht negativ sein", "Bitte einen positiven Betrag eintragen.");
  else if (p.anteil != null && p.anteil === 0) warn("anteil", "Geschäftsanteil ist 0 €", "Ein Geschäftsanteil von 0 € ist unüblich. Bitte prüfen.");

  for (const [feld, wert, name] of [["invest", p.invest, "Investitionsgrenze"], ["darlehen", p.darlehen, "Darlehensgrenze"], ["dauer", p.dauer, "Dauerschuldgrenze"]]) {
    if (wert != null && wert < 0) err(feld, `${name} kann nicht negativ sein`, "Positiven Betrag eintragen oder Feld leer lassen.");
  }

  if (p.quorum != null && p.quorum < 0) err("quorum", "Beschlussfähigkeit kann nicht negativ sein", "Bitte korrigieren.");
  else if (p.quorum != null && p.mitglieder != null && p.mitglieder > 0 && p.quorum > p.mitglieder) warn("quorum", "Beschlussfähigkeit verlangt mehr Mitglieder als vorhanden", "So könnte nie eine wirksame Generalversammlung zustande kommen.");

  if (p.weisung && p.mitglieder != null && p.mitglieder > 20) warn("weisung", "Weisungsrecht nur bei höchstens 20 Mitgliedern", "§ 27 Abs. 2 GenG erlaubt das Weisungsrecht nur kleinen eGs.");

  return { errors, warnings };
}
