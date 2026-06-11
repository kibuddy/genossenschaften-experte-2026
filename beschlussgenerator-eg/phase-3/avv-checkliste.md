# AVV-/Auftragsverarbeitungs-Checkliste (Art. 28 DSGVO)

**Version:** 0.9 (Entwurf) · **Stand:** 11.06.2026 · Rollen: Kunden-eG = Verantwortlicher · GenoPilot eG = Auftragsverarbeiter · Anthropic & Supabase = Unterauftragsverarbeiter

## 1. Anthropic (KI-Formulierung)

- [ ] Commercial Terms / Data Processing Addendum abgeschlossen (enthält AVV-Regelungen)
- [ ] Bestätigt: **keine Trainingsnutzung** der API-Ein-/Ausgaben
- [ ] Drittlandtransfer abgesichert: EU-US **Data Privacy Framework**-Zertifizierung geprüft und/oder **SCC** Bestandteil des DPA (Nachweis ablegen)
- [ ] Datenaufbewahrung/Retention des Anbieters dokumentiert (Zero-Retention-Optionen prüfen)
- [ ] Subprozessoren-Liste des Anbieters gesichtet, Änderungs-Benachrichtigung abonniert
- [ ] Technisch flankiert: Pseudonymisierung vor Versand, Prompt enthält keine Mitglieder-Stammdaten

## 2. Supabase (Hosting, DB, Edge Functions)

- [ ] Projekt in **EU-Region** (z. B. eu-central-1) angelegt – Region im Vertrag/Projekt dokumentiert
- [ ] Supabase DPA abgeschlossen, Subprozessoren geprüft
- [ ] RLS-Mandantentrennung aktiv (Migration `0001_schema.sql`), Backups EU

## 3. GenoPilot eG ↔ Kunden-Genossenschaften

- [ ] Eigener AVV-Mustervertrag für Kunden (Teil der AGB-Erstellung, Budgetposten „Recht & DSGVO" im Businessplan)
- [ ] TOMs beschrieben (Auth, RLS, Verschlüsselung at rest/in transit, Audit-Log, Zugriffskonzept)
- [ ] Verarbeitungsverzeichnis (Art. 30) für beide Seiten vorbereitet
- [ ] Lösch-/Exportkonzept (Betroffenenrechte Art. 15–20) definiert

## 4. Nachweise-Ablage

Ablageort für unterschriebene Verträge/Nachweise: `phase-3/nachweise/` (nicht ins öffentliche Repo!) bzw. DMS der eG.
