// Lokaler Dev-Proxy für den Beschluss-Generator V8.2 (ohne Abhängigkeiten, Node >= 20)
//
// Start:   ANTHROPIC_API_KEY=sk-ant-... node phase-1/dev-proxy/server.mjs
// Browser: http://localhost:8787/beschluss-generator-v8.2.html
//
// Verhält sich wie die Supabase Edge Function (phase-1/supabase/functions/ki-formulierung):
// gleicher Endpoint-Pfad /api/ki-formulierung, gleicher System-Prompt, gleiches Schema.

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.join(__dirname, "..", "app");
const PORT = Number(process.env.PORT || 8787);
const MAX_PROMPT_CHARS = 8000;

// KEEP IN SYNC mit phase-1/supabase/functions/ki-formulierung/index.ts
const SYSTEM_PROMPT =
  "Du bist ein Assistent, der Vorständen kleiner deutscher Genossenschaften (eG) hilft, " +
  "aus stichpunktartigen Notizen saubere Textbausteine für einen Beschluss-Entwurf zu formulieren. " +
  "Schreibe in klarer, sachlicher deutscher Verwaltungs- und Beschlusssprache, vollständige Sätze. " +
  "Erfinde KEINE Fakten, Zahlen oder Sachverhalte, die nicht in der Eingabe stehen — fehlende konkrete " +
  "Angaben kennzeichnest du mit eckigen Klammern als Platzhalter, z. B. [Anschaffungswert]. " +
  "Gib KEINE Rechtsberatung und triff keine Aussagen über die Wirksamkeit.";

// KEEP IN SYNC mit phase-1/supabase/functions/ki-formulierung/index.ts
const SCHEMA = {
  type: "object",
  properties: {
    ueberschrift: { type: "string", description: "Präzise, sachliche Überschrift des Beschlussgegenstands, 1 Satz" },
    begruendung: {
      type: "string",
      description: "2 bis 5 vollständige Sätze zu Sachverhalt und Begründung; fehlende Werte als [Platzhalter]",
    },
    foerderzweck_bezug: { type: "string", description: "2 bis 4 Sätze Mitgliederförderung (Bezug zu § 1 GenG)" },
  },
  required: ["ueberschrift", "begruendung", "foerderzweck_bezug"],
  additionalProperties: false,
};

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(body);
}

async function handleKi(req, res) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return send(res, 400, { error: "Ungültiges JSON im Request-Body" });
  }
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return send(res, 400, { error: "Feld 'prompt' fehlt oder ist leer" });
  if (prompt.length > MAX_PROMPT_CHARS) return send(res, 413, { error: `Eingabe zu lang (max. ${MAX_PROMPT_CHARS} Zeichen)` });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return send(res, 500, { error: "ANTHROPIC_API_KEY ist nicht gesetzt (Umgebungsvariable)" });

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-opus-4-8",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    }),
  });

  if (!resp.ok) {
    console.error("Anthropic-Fehler", resp.status, (await resp.text()).slice(0, 500));
    return send(res, 502, { error: `KI-Dienst nicht erreichbar (${resp.status})` });
  }
  const data = await resp.json();
  if (data.stop_reason === "refusal") return send(res, 422, { error: "Die KI hat die Anfrage abgelehnt. Bitte Eingabe anpassen." });
  const text = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return send(res, 502, { error: "Unerwartetes Antwortformat des KI-Dienstes" });
  }
  return send(res, 200, {
    ueberschrift: typeof parsed.ueberschrift === "string" ? parsed.ueberschrift : "",
    begruendung: typeof parsed.begruendung === "string" ? parsed.begruendung : "",
    foerderzweck_bezug: typeof parsed.foerderzweck_bezug === "string" ? parsed.foerderzweck_bezug : "",
  });
}

async function handleStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const rel = urlPath === "/" ? "beschluss-generator-v8.2.html" : urlPath.slice(1);
  const file = path.join(APP_DIR, rel);
  if (!file.startsWith(APP_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

http
  .createServer(async (req, res) => {
    try {
      if (req.url.startsWith("/api/ki-formulierung")) {
        if (req.method !== "POST") return send(res, 405, { error: "Nur POST erlaubt" });
        return await handleKi(req, res);
      }
      return await handleStatic(req, res);
    } catch (e) {
      console.error(e);
      return send(res, 500, { error: "Interner Fehler" });
    }
  })
  .listen(PORT, () => {
    console.log(`Beschluss-Generator V8.2: http://localhost:${PORT}/`);
    console.log(process.env.ANTHROPIC_API_KEY ? "API-Key gefunden – KI-Formulierung aktiv." : "WARNUNG: ANTHROPIC_API_KEY nicht gesetzt – KI-Formulierung liefert Fehler, UI läuft trotzdem.");
  });
