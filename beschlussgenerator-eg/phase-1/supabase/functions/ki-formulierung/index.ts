// Supabase Edge Function: KI-Formulierung für den Beschluss-Generator (Phase 1 / V8.2)
//
// Zweck: Serverseitiger EU-Proxy zur Anthropic-API. Der API-Key bleibt als Secret auf dem
// Server; der Browser sendet nur den fachlichen Prompt. Antwortformat ist per Structured
// Outputs garantiert (JSON-Schema), das fragile Client-Parsing aus V8.1 entfällt.
//
// Deploy:
//   supabase functions deploy ki-formulierung --no-verify-jwt   # Prototyp; ab Phase 2 mit Auth
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Der Client (beschluss-generator-v8.2.html) setzt dann:
//   window.KI_ENDPOINT = "https://<projekt>.supabase.co/functions/v1/ki-formulierung";

// KEEP IN SYNC mit phase-1/dev-proxy/server.mjs
const SYSTEM_PROMPT =
  "Du bist ein Assistent, der Vorständen kleiner deutscher Genossenschaften (eG) hilft, " +
  "aus stichpunktartigen Notizen saubere Textbausteine für einen Beschluss-Entwurf zu formulieren. " +
  "Schreibe in klarer, sachlicher deutscher Verwaltungs- und Beschlusssprache, vollständige Sätze. " +
  "Erfinde KEINE Fakten, Zahlen oder Sachverhalte, die nicht in der Eingabe stehen — fehlende konkrete " +
  "Angaben kennzeichnest du mit eckigen Klammern als Platzhalter, z. B. [Anschaffungswert]. " +
  "Gib KEINE Rechtsberatung und triff keine Aussagen über die Wirksamkeit.";

// KEEP IN SYNC mit phase-1/dev-proxy/server.mjs
const SCHEMA = {
  type: "object",
  properties: {
    ueberschrift: {
      type: "string",
      description: "Präzise, sachliche Überschrift des Beschlussgegenstands, 1 Satz, keine Stichpunktsprache",
    },
    begruendung: {
      type: "string",
      description:
        "2 bis 5 vollständige Sätze in sachlicher Beschlusssprache zu Sachverhalt und Begründung; " +
        "Zahlen/Berechnungen aus der Notiz übernehmen, fehlende konkrete Werte als [Platzhalter]",
    },
    foerderzweck_bezug: {
      type: "string",
      description:
        "2 bis 4 Sätze, inwiefern die Maßnahme die Mitglieder fördert (Bezug zu § 1 GenG); " +
        "an den hinterlegten Förderzweck anknüpfen, falls vorhanden",
    },
  },
  required: ["ueberschrift", "begruendung", "foerderzweck_bezug"],
  additionalProperties: false,
};

const MAX_PROMPT_CHARS = 8000;

const CORS = {
  "Access-Control-Allow-Origin": "*", // Prototyp; in Phase 2 auf die App-Domain einschränken
  "Access-Control-Allow-Headers": "content-type, authorization, x-client-info, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "content-type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "Nur POST erlaubt" }, 405);

  let body: { prompt?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Ungültiges JSON im Request-Body" }, 400);
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return json({ error: "Feld 'prompt' fehlt oder ist leer" }, 400);
  if (prompt.length > MAX_PROMPT_CHARS) {
    return json({ error: `Eingabe zu lang (max. ${MAX_PROMPT_CHARS} Zeichen)` }, 413);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "ANTHROPIC_API_KEY ist serverseitig nicht konfiguriert" }, 500);

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-8",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    console.error("Anthropic-Fehler", resp.status, detail.slice(0, 500));
    return json({ error: `KI-Dienst nicht erreichbar (${resp.status})` }, 502);
  }

  const data = await resp.json();
  if (data.stop_reason === "refusal") {
    return json({ error: "Die KI hat die Anfrage abgelehnt. Bitte Eingabe anpassen." }, 422);
  }
  const text = (data.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error("Unerwartetes Antwortformat:", text.slice(0, 300));
    return json({ error: "Unerwartetes Antwortformat des KI-Dienstes" }, 502);
  }

  return json({
    ueberschrift: typeof parsed.ueberschrift === "string" ? parsed.ueberschrift : "",
    begruendung: typeof parsed.begruendung === "string" ? parsed.begruendung : "",
    foerderzweck_bezug: typeof parsed.foerderzweck_bezug === "string" ? parsed.foerderzweck_bezug : "",
  });
});
