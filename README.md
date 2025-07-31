# Bestellmeldung-Tool

Ein einfaches Tool zur Bedarfsmeldung von Artikeln mit E-Mail-Benachrichtigung und Statusverfolgung.

## Setup

1. Supabase-Projekt erstellen
2. Tabellen mit SQL-Dateien einrichten (`/supabase/schema.sql`)
3. .env-Datei ausfüllen
4. Frontend starten mit:
```bash
cd frontend
npm install
npm run dev
```

## Funktionen
- Bedarfsmeldung mit Artikelname, Restbestand und Mitarbeitendenname
- E-Mail an t.jensen@semcoglas.de
- Passwortgeschützte Statusänderung
- Archivierung nach 7 Tagen bei Status "geliefert"
