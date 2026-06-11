# Visuelles Konzept: Remotion für den Beschluss-Generator

## Einordnung: Wofür Remotion das richtige Werkzeug ist – und wofür nicht

[Remotion](https://www.remotion.dev/) ist ein React-Framework für **programmatisch erzeugte Videos und Animations-Kompositionen**. Es spielt seine Stärke aus, wenn Inhalte **datengetrieben animiert** werden sollen – genau unser Fall: Der Entscheidungsweg eines Beschlusses (Vorstand? GV? Schwelle? Mehrheit?) ist ein Datenfluss, den man hervorragend animiert erzählen kann.

| Bedarf | Werkzeug |
|---|---|
| Erklärvideos, animierte Entscheidungswege, Onboarding-Clips, personalisierte Ergebnis-Animationen | **Remotion** (Player im Browser, Lambda/SSR fürs Rendern von MP4s) |
| Mikro-Interaktionen im UI (Hover, Einblenden des Ergebnisses, Akkordeons) | CSS-Transitions / Framer Motion – *nicht* Remotion (zu schwergewichtig) |

Empfehlung: **beides kombinieren** – Remotion für die fünf unten beschriebenen Kompositionen, Framer Motion für die heutigen `fade`-Animationen des Prototyps.

## Die zwei Einsatzformen

1. **`@remotion/player`** – die Komposition läuft als interaktive React-Komponente direkt in der App (kein Video-Rendering nötig, props-gesteuert, reagiert live auf die Nutzereingaben). Das ist der Hauptpfad für den Generator.
2. **Gerenderte MP4s** (Remotion Lambda oder lokal) – für Marketing, Investoren-Pitch (passt zum Pitchdeck) und Onboarding-Mails. Einmal gebaute Kompositionen lassen sich für beides verwenden.

## Geplante Kompositionen

### K1 – „Der Weg Ihres Beschlusses" (Kernstück, Player, datengetrieben)
Nach Klick auf „Entwurf formulieren" zeigt eine 8–12-Sekunden-Animation den Entscheidungsweg, den die Regel-Engine gegangen ist:

```
Ihre Eingabe ──▶ [Vorgangsart: Investition]
                     │
                     ▼ Satzungsgrenze 10.000 € ── Betrag 15.000 € liegt darüber
                     ▼
              ┌──────────────────┐
              │ Generalversammlung│  ← Knoten leuchtet auf (lila, wie GV-Badge)
              └──────────────────┘
                     ▼
        Mehrheit: einfach · Beschlussfähig ab 3 Mitgliedern
```

Die Animation bekommt das `resolve()`-Ergebnis als Props (`organ`, `tor`, `schwelle`, `maj`, `esk`) – **dieselben Daten, die heute das Text-Verdikt füllen**. Nutzen: Vorstände *verstehen*, warum die GV zuständig ist, statt es nur zu lesen. Das ist das stärkste Vertrauens-Feature gegenüber „Black-Box-KI" und unterstreicht die Werkzeug-Positionierung.

### K2 – Onboarding „In 3 Minuten zum sauberen Beschluss" (MP4 + Player)
Geführter Durchlauf: Profil ausfüllen → Stichpunkte eintippen → Entwurf prüfen → herunterladen. Erfüllt nebenbei die Art.-4-AI-Act-Anforderung (KI-Kompetenz der Nutzer) und reduziert Support – im Businessplan tragen die Gründer den Support anfangs selbst.

### K3 – „Was die KI tut – und was nicht" (MP4, 45 Sek.)
Transparenz-Clip: Stichpunkte rein → KI formuliert → Mensch prüft → Qualitätscheck markiert Zahlen. Visualisiert die Art.-50-Geschichte und die Disclaimer, statt sie nur als Textwand zu zeigen.

### K4 – Status-Animation „Beschluss-Lebenszyklus" (Player, ab Phase 2)
Entwurf → zur Abstimmung → angenommen → archiviert (mit Hash-Symbol). Kleine Komposition je Statuswechsel in der Beschlussliste der Plattform.

### K5 – Pitch-/Marketing-Renderings (MP4)
Die Produktvorschau-Mockups aus dem Pitchdeck als animierte Sequenzen – aus denselben Kompositionen gerendert, Corporate Design (Dunkelblau `#0d1b2a`, Gold `#c9a84c`, wie im Prototyp) als gemeinsames Theme-Paket.

## Technische Skizze (K1)

```tsx
// remotion/BeschlussWeg.tsx
import {Player} from '@remotion/player';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, spring, useVideoConfig} from 'remotion';

type BeschlussWegProps = {
  vorgang: string;            // r.label
  organ: 'Vorstand' | 'Generalversammlung' | 'Aufsichtsrat';
  betrag?: number;
  schwelle?: number;
  mehrheit?: string;          // "¾" | "einfach"
  eskalation?: string;        // "Prüfverband empfohlen" …
};

const Knoten: React.FC<{label: string; aktiv: boolean; delay: number}> = ({label, aktiv, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame: frame - delay, fps, config: {damping: 12}});
  return (
    <div style={{
      transform: `scale(${scale})`,
      border: `2px solid ${aktiv ? '#a77bf5' : '#2a3f57'}`,
      background: aktiv ? 'rgba(167,123,245,.15)' : '#18293d',
      borderRadius: 12, padding: '12px 20px', color: '#dde6ef',
    }}>{label}</div>
  );
};

export const BeschlussWeg: React.FC<BeschlussWegProps> = (props) => (
  <AbsoluteFill style={{background: '#0d1b2a', alignItems: 'center', justifyContent: 'center', gap: 24}}>
    <Sequence from={0}><Knoten label={props.vorgang} aktiv={false} delay={0} /></Sequence>
    {props.schwelle != null && (
      <Sequence from={20}>
        <Knoten label={`Satzungsgrenze ${props.schwelle.toLocaleString('de-DE')} € — Betrag ${props.betrag?.toLocaleString('de-DE')} €`} aktiv={false} delay={20} />
      </Sequence>
    )}
    <Sequence from={45}><Knoten label={`Zuständig: ${props.organ}`} aktiv delay={45} /></Sequence>
    {props.mehrheit && <Sequence from={70}><Knoten label={`Mehrheit: ${props.mehrheit}`} aktiv={false} delay={70} /></Sequence>}
  </AbsoluteFill>
);

// Einbindung in der App – gefüttert mit dem resolve()-Ergebnis der Regel-Engine:
// <Player component={BeschlussWeg} inputProps={resolveResult}
//         durationInFrames={120} fps={30}
//         compositionWidth={780} compositionHeight={440}
//         controls={false} autoPlay style={{width: '100%'}} />
```

## Umsetzungsempfehlung & Reihenfolge

1. **K1 zuerst** (mit Phase 2 der Roadmap, da React-Migration Voraussetzung ist) – größter Produktnutzen.
2. K2/K3 als gerenderte MP4s können **unabhängig vom Produktcode sofort** gebaut werden (eigenes `remotion/`-Paket in diesem Repo) – nützlich für Pilot-Akquise und Verbandsgespräche.
3. Gemeinsames Theme-Paket (Farben/Typo aus dem Prototyp) von Anfang an, damit App und Videos identisch aussehen.

**Aufwand (Indikation):** Theme + K1 ≈ 3–5 Tage, K2/K3 je ≈ 2–3 Tage inkl. Sprecher-Text, K4 ≈ 1–2 Tage. Rendering-Kosten bei Lambda vernachlässigbar (wenige Videos, keine Massen-Personalisierung).
