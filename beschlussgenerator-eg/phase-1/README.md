# Phase 1 – Funktionsfähig & sicher (V8.2)

Prototyp V8.2 = V8.1 plus die kritischen Fixes aus dem Prüfbericht (`docs/01-pruefbericht.md`):

| Fix | Befund | Umsetzung |
|---|---|---|
| KI-Anbindung funktionsfähig & sicher | A1, A2, E1 | Client ruft `/api/ki-formulierung` (Proxy) statt `api.anthropic.com`. Key, Pflicht-Header (`x-api-key`, `anthropic-version`) und Modell **`claude-opus-4-8`** liegen serverseitig; Antwortformat per **Structured Outputs** (JSON-Schema) garantiert. |
| XSS in der Entwurfsanzeige | A3 | `escHtml()` vor jedem `innerHTML`-Einfügen in `renderDoc()`. |
| Aufsichtsrats-Bug | A4 | Neue Beschlussart **„AR-Beschluss"** (`artFuer()`), eigener Nummernkreis **AR** (`kreisVon()`), „Der Aufsichtsrat" im Dokumenttext, Prüfmodus erkennt `JJJJ-AR-nnn`. |
| Sitzungsform ↔ Dokumentvariante | B6 | Bei Form „schriftlich" wird die Variante „Schriftl./elektr. Beschluss" vorgewählt. |
| Profil-Persistenz | B2 (Zwischenlösung) | eG-Profil wird in `localStorage` gespeichert und beim Laden wiederhergestellt. |

## Lokal starten (ohne Supabase)

```bash
ANTHROPIC_API_KEY=sk-ant-... node phase-1/dev-proxy/server.mjs
# → http://localhost:8787/
```

Ohne Key läuft die UI trotzdem (deterministische Engine, Prüfen, Download); nur die KI-Formulierung meldet dann einen Fehler und übernimmt den Rohtext – wie der Fallback in V8.1, nur ehrlich.

## Produktiv: Supabase Edge Function (EU-Region!)

```bash
# Projekt in EU-Region (z. B. eu-central-1) anlegen, dann:
supabase functions deploy ki-formulierung --no-verify-jwt   # Prototyp; ab Phase 2 mit Auth
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

Im HTML vor dem schließenden `</script>` (oder per separatem Snippet) den Endpoint setzen:

```html
<script>window.KI_ENDPOINT="https://<projekt>.supabase.co/functions/v1/ki-formulierung";</script>
```

## Sicherheits-/Compliance-Hinweise

- `Access-Control-Allow-Origin: *` ist Prototyp-Komfort – vor Pilotbetrieb auf die App-Domain einschränken.
- `--no-verify-jwt` nur für die Demo; ab Phase 2 läuft der Aufruf authentifiziert (Supabase Auth).
- AVV/DPA mit Anthropic und Verarbeitungsverzeichnis: siehe `phase-3/avv-checkliste.md`.
