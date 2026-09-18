# VNB-Suche

Lokale Web-App zur Suche in Verteilnetzbetreiber-Stammdaten (CSV/JSON).

## Installation & Start

```bash
npm install
npm run dev
```

Entwicklungsserver: Vite (Standardport, meist `http://localhost:5173/vnb-web/`).

## Daten austauschen

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
