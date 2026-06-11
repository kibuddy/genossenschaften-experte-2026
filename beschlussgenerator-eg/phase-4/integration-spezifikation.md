# Phase 4 – Integrations-Spezifikation: Beschluss-Generator in der GenoPilot-Plattform

**Status:** Konzept (Umsetzung ab MVP-Phase des Businessplans). Grundlage: Pitchdeck-Module „Beschlüsse", „Generalversammlung", „Mitgliederverwaltung".

## 1. Mitgliederverwaltung → Beschluss-Generator

| Integration | Beschreibung |
|---|---|
| Unterschriftenblock | Vorstands-/AR-Mitglieder kommen aus den Stammdaten statt `[Vorstand 1]`-Platzhaltern; Vertretungsregelung (einzeln/gemeinsam) aus dem eG-Profil |
| Stimmverbots-Prüfung | Bei Vorgängen mit `stimmverbot` (Wissensbasis) wird das betroffene Mitglied gegen die Mitgliederliste aufgelöst und im Protokollentwurf namentlich vom Stimmrecht ausgenommen (pseudonymisiert an die KI, Klarname nur im finalen Dokument) |
| Quoren | Beschlussfähigkeit wird gegen die tatsächliche Mitgliederzahl geprüft, nicht gegen den manuell gepflegten Profilwert |
| Investierende Mitglieder | § 8 Abs. 2-Feststellung wird automatisch eingefügt, wenn investierende Mitglieder in den Stammdaten existieren |

## 2. Versammlungsmodul ↔ Beschluss-Generator

Lebenszyklus (Statusmodell aus Phase 2 erweitert):

```
Entwurf ──▶ als TOP eingeplant ──▶ abgestimmt ──▶ final/abgelehnt ──▶ archiviert
   │              │                     │
   │              ▼                     ▼
   │        Einladung/Tagesordnung   Abstimmungsergebnis (Ja/Nein/Enthaltung)
   │        (Frist-Check § 46 GenG)  wird in den Beschluss zurückgeschrieben
   ▼
 Aktenvermerk (kein TOP nötig)
```

- **Beschluss → TOP:** Ein GV-/AR-pflichtiger Entwurf erzeugt per Klick einen Tagesordnungspunkt inkl. Beschlussvorlage; Ladungsfrist-Check gegen Satzung/§ 46 GenG.
- **Abstimmung → Beschluss:** Das im Versammlungsmodul erfasste Ergebnis (auch digitale Abstimmung nach § 43b GenG) füllt `Abstimmungsergebnis`, setzt Status `final` und löst die Nummernvergabe + Audit-Log-Eintrag aus.
- **Protokoll:** Der Protokollauszug des Generators wird Bestandteil des GV-Protokolls (ein Dokumentenstamm, keine Kopien).

## 3. E-Signatur-Add-on (Businessplan: ~10–15 €/Signatur, durchgereicht)

- Anbieterkandidat lt. Businessplan: Yousign (eIDAS: FES für Standardbeschlüsse, QES wo Schriftform gefordert).
- Ablauf: finaler Beschluss (PDF/A) → Signaturmappe an Unterzeichner aus der Mitgliederverwaltung → signiertes Dokument + Signaturnachweis in die revisionssichere Ablage; Audit-Log-Eintrag mit Dokument-Hash.
- Abrechnung: Signaturvorgänge werden je eG gezählt (Add-on-Billing, Premium-Plan).

## 4. KI-Assistent (Plattform-Kernmodul)

- Der Plattform-Chat („Fragen zu Satzung, Fristen, Pflichten") verlinkt bei beschlussrelevanten Antworten direkt in den Generator mit vorausgefüllter Vorgangsart (`regel.typ` aus der gemeinsamen Wissensbasis `geng-engine/regeln.json` – eine Quelle für Chat und Generator).
- Satzungsmodul-Anbindung: aus der KI-Satzungsauswertung extrahierte Werte (Schwellen, Zustimmungskatalog, Quoren) befüllen das eG-Profil – mit Anzeige der Fundstelle und menschlicher Bestätigung je Wert.

## 5. Schnittstellen-Skizze (Phase-2-Datenmodell erweitert)

- `beschluesse.versammlung_id` (FK, nullable) + `beschluesse.top_nr`
- `versammlungen` (id, eg_id, typ GV/AR, datum, ladung_versendet_at, protokoll_doc_id, …)
- `abstimmungen` (beschluss_id, ja, nein, enthaltung, festgestellt_von, festgestellt_at)
- `signaturen` (beschluss_id, anbieter, niveau FES/QES, status, nachweis_doc_id, kosten_cent)
- Events (Audit-Log-Aktionen): `top_erstellt`, `abgestimmt`, `signatur_angefordert`, `signiert`, `archiviert`

## 6. Remotion-Anknüpfung

Statuswechsel des Lebenszyklus triggern die Player-Komposition K4 („Beschluss-Lebenszyklus", siehe `docs/03-remotion-konzept.md`); das Onboarding-Video K2 wird Teil des Plattform-Onboardings.
