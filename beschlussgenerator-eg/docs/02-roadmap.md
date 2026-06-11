# Roadmap: Vom Prototyp V8.1 zum Produkt

Ziel: Der Beschluss-Generator wird vom Single-File-Prototyp zum ersten produktiven Modul der GenoPilot-Plattform – ohne den fachlichen Kern (Regel-Engine) wegzuwerfen.

## Leitprinzipien

1. **Deterministische Rechtslogik bleibt im Code, KI formuliert nur.** Das ist die Haftungs- und Qualitätsstrategie des Prototyps – sie bleibt.
2. **Kein API-Key, keine Mitgliederdaten im Browser.** Alles KI-seitige läuft über einen EU-Proxy.
3. **Jede Phase liefert etwas Nutzbares** für die 3–5 Pilot-Genossenschaften aus dem Businessplan.

## Zielarchitektur

```
Browser (React/Next.js + Remotion Player)
   │  HTTPS
   ▼
Supabase (EU-Region)
   ├─ Auth (Magic-Link/E-Mail) – ehrenamtstauglich
   ├─ Postgres + Row-Level-Security  → strikte Mandantentrennung je eG
   │    ├─ eg_profile (Satzungswerte, Förderzweck, Schwellen, Organe)
   │    ├─ beschluesse (Entwürfe, Final, Status, Versionen)
   │    ├─ beschluss_nummern (transaktionale Zählkreise V/GV/AR je Jahr)
   │    └─ audit_log (Hash-Kette → revisionssichere Ablage)
   ├─ Edge Function "ki-formulierung"
   │    └─ Anthropic API (claude-opus-4-8, Structured Outputs,
   │       Header x-api-key + anthropic-version serverseitig)
   └─ Storage (DOCX/PDF-Ablage, EU)
```

Die bestehende **Regel-Engine (REGELN, resolve, PFLICHT, Validierung)** wird als eigenständiges TypeScript-Paket `@genopilot/geng-engine` extrahiert – mit den Regeltexten als versionierte JSON-Wissensbasis (juristisch abnehmbar, testbar, im UI und in der Prüf-Funktion wiederverwendbar).

### KI-Aufruf (Soll-Zustand, Edge Function)

```ts
// Supabase Edge Function – der Key bleibt serverseitig (Secret)
const resp = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-opus-4-8",
    max_tokens: 2000,
    system: SYSTEM_PROMPT, // wie V8.1: nichts erfinden, Platzhalter, keine Rechtsberatung
    messages: [{ role: "user", content: userPrompt }],
    output_config: {                      // erzwingt valides JSON –
      format: {                           // ersetzt das fragile Regex-Parsing
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            ueberschrift: { type: "string" },
            begruendung: { type: "string" },
            foerderzweck_bezug: { type: "string" },
          },
          required: ["ueberschrift", "begruendung", "foerderzweck_bezug"],
          additionalProperties: false,
        },
      },
    },
  }),
});
```

Der KI-Qualitätscheck (Zahlen-Diff, Platzhalter-Liste) aus V8.1 wird unverändert übernommen und zusätzlich serverseitig geloggt (Qualitätsmetrik).

## Phasen

### Phase 1 – „Funktionsfähig & sicher" (1–2 Wochen, parallel zur eG-Gründung)
- Supabase-Projekt (EU) + Edge-Function-Proxy; API-Key raus aus dem Client
- Modellwechsel auf `claude-opus-4-8` + Structured Outputs (Befunde A1/A2)
- XSS-Fix, AR-Beschlussart/-Zählkreis, Format-Kopplung (A3, A4, B6)
- Profil-Persistenz zunächst in `localStorage`
- **Ergebnis:** Der heutige Prototyp funktioniert erstmals end-to-end mit KI – demo-fähig für Pilotgespräche.

### Phase 2 – „Mandantenfähig & revisionssicher" (4–6 Wochen)
- Migration auf Next.js + Supabase Auth + RLS (Mandantentrennung je eG)
- Serverseitige Beschlussnummern (transaktional, Zählkreise V/GV/AR je Jahr)
- Beschluss-Lebenszyklus: Entwurf → final → archiviert; Audit-Log mit Hash-Kette (ersetzt die lokale SHA-256-Notlösung)
- Echte DOCX-Erzeugung + PDF/A-Export für die Ablage
- Regel-Wissensbasis extrahiert + juristische Abnahme (Prüfbericht C1–C5)
- **Ergebnis:** Pilot-tauglich für 3–5 Genossenschaften (Businessplan, Phase „Prototyp/MVP").

### Phase 3 – „Compliance & Vertrauen" (parallel zu Phase 2 beginnen)
- AVV/DPA Anthropic, Verarbeitungsverzeichnis, DSFA-Prüfung, Datenschutzerklärung
- AI-Act-Assessment (Einstufung, Art.-50-Transparenztexte final – Stichtag **02.08.2026**)
- Maschinenlesbare KI-Kennzeichnung an finales EU-Format anpassen, sobald Code of Practice vorliegt
- Vorbereitung Security-Audit/Pentest (Budgetposten im Businessplan)

### Phase 4 – „Integration in die Plattform" (ab MVP-Phase des Businessplans)
- Anbindung an Mitgliederverwaltung (Unterschriftenblöcke aus echten Vorstandsdaten, Stimmverbots-Prüfung gegen Mitgliederliste)
- Anbindung Versammlungsmodul (Beschluss → Tagesordnungspunkt → Protokoll → Abstimmungsergebnis zurückschreiben)
- Qualifizierte E-Signatur als kostenpflichtiges Add-on (Businessplan: ~10–15 €/Signatur, durchgereicht)
- Remotion-Erklärvideos im Onboarding (siehe `03-remotion-konzept.md`)

## Was bewusst NICHT getan wird

- **Kein eigenes „Rechts-LLM"**: Die KI bewertet weiterhin keine Rechtsfragen, sie formuliert. Zuständigkeit/Mehrheiten kommen aus der geprüften Regel-Engine.
- **Keine Automatik ohne Mensch**: Jeder Entwurf erfordert explizite menschliche Freigabe (Art.-50-Story, Haftungsstrategie des Businessplans).
- **Kein Feature-Ausbau vor Phase 1/2**: Erst sicher und mandantenfähig, dann breiter.
