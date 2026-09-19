# VNB-Suche

Web-App zur Suche in **Verteilnetzbetreiber-Stammdaten** (MaStR/CSV). Läuft lokal mit Vite und als GitHub Pages.

**Live:** https://phish3144.github.io/vnb-web/

## Features

- Schnellsuche und Ergebnisliste
- Erweiterte Filter
- Detailansicht (u. a. Aktionsbuttons, leere Bereiche ausblenden, Meta einklappbar)
- Hell-/Dunkelmodus
- Lokale Overrides / Werkzeuge für Datenpflege in der UI (siehe `src/overrides.ts`, `OverridesToolbar`, `ToolsPanel`)

## Installation & Start

```bash
npm install
npm run dev
```

Entwicklungsserver: Vite (Standardport, meist `http://localhost:5173/vnb-web/`).

## Daten

Daten liegen unter `public/data/`.

- CSV: `public/data/vnb.csv` (Semikolon, UTF-8, optional BOM)
- Optional JSON mit denselben Feldern: `public/data/vnb.json` (wird bevorzugt geladen, falls vorhanden)

Pfad/Basisname in `src/config.ts` anpassen (`DATA_BASE`).

## Build & GitHub Pages

```bash
npm run build
```

Ausgabe: `dist/`. Die Vite-`base` ist `/vnb-web/` (Projektseite).

Workflow: `.github/workflows/deploy-pages.yml` baut und deployed bei Push auf `main` nach GitHub Pages.

## Daten aktualisieren (MaStR / Enrichment)

### Manuell

CSV unter `public/data/vnb.csv` ersetzen (Semikolon, UTF-8), committen und auf `main` pushen → `deploy-pages.yml` deployed GitHub Pages.

### Automatisch (Refresh-Workflow)

1. Repo-Variable oder Secret `VNB_CSV_URL` auf die URL eines **Slim**-CSV-Exports setzen.
2. Workflow **Refresh VNB data** (`.github/workflows/refresh-data.yml`) manuell starten oder wöchentlich (So 04:00 UTC) laufen lassen.
3. Ohne `VNB_CSV_URL`: No-Op (Job bleibt grün, keine Dateiänderung).

**Wichtig:** Niemals den MaStR-Voll-Dump (~3 GB) oder eine open-mastr-Datenbank ins Repo laden. Nur schlanke Exporte.

Quelle: Markstammdatenregister (MaStR) der BNetzA; Lizenz typischerweise [DL-DE-BY-2.0](https://www.govdata.de/dl-de/by-2-0).