# VNB-Suche

Web-App zur Suche in **Verteilnetzbetreiber-Stammdaten** (MaStR/CSV) inkl. TAB-Links, Anmeldeportal und Planauskunft. Läuft lokal mit Vite und als GitHub Pages.

**Live:** https://phish3144.github.io/vnb-web/

## Datenstand

Im Repo unter `public/data/` (Stand laut `Recherche_Datum` / letztem CSV-Commit):

| | |
|---|---|
| Datensätze | **981** VNBs |
| Recherche-Datum | **2026-09-18** (alle Zeilen) |
| Mit Website | ~97 % |
| Mit MaStR-Nummer | ~96 % |
| Mit primärem TAB-Link (HTTP) | ~16 % (157; Ergänzung bevorzugt, sonst Niederspannung) |
| Davon TAB-Ergänzungslink | 56 |
| Nur TAB Niederspannung (HTTP, ohne Ergänzung) | ~101 |
| Mit Anmeldeportal (HTTP) | ~73 (~7 %) |
| Mit Planauskunft | ~4 % |

`TAB_Typ` (aktuell): überwiegend `Leer` / `Unbekannt`, daneben u. a. `BDEW_Muster`, `VNB_Ergaenzung`, `Regional`. Große TAB-Ergänzungen für große VNBs wurden parallel recherchiert und ins CSV übernommen (Commit vom 18.09.2026).

Die Prozentwerte ändern sich mit jedem Daten-Refresh — bei Unsicherheit CSV/JSON im Repo prüfen.

## Features

- Schnellsuche und Ergebnisliste (u. a. umlaut-/ß-tolerant)
- Erweiterte Filter: Bundesland, Website/TAB/Portal vorhanden oder fehlend, **TAB-Typ**, **VNB-TAB-Ergänzung**, Besonderheiten
- Detailansicht mit Aktionsbuttons (TAB-Ergänzung, TAB NS, Anmeldeportal, Planauskunft, Website); leere Bereiche ausblenden, Meta einklappbar
- Hell-/Dunkelmodus
- Lokale Overrides / Werkzeuge für Datenpflege in der UI (`src/overrides.ts`, `OverridesToolbar`, `ToolsPanel`)

## TAB-Felder (CSV)

| Feld | Bedeutung |
|---|---|
| `TAB_Niederspannung_Link` | Link zur TAB Niederspannung |
| `TAB_Ergaenzung_Link` | VNB-eigene TAB-Ergänzung (wird als primärer TAB-Link bevorzugt) |
| `TAB_Typ` | z. B. `VNB_Ergaenzung`, `BDEW_Muster`, `Regional`, `Leer`, `Unbekannt` |
| `TAB_Stand` | Stand / Version der TAB, soweit bekannt |
| `Anmeldeportal` | Link zum Anmelde-/Kundenportal |
| `Planauskunft_Link` | Link zur Planauskunft |

In der App gilt: **primärer TAB-Link** = `TAB_Ergaenzung_Link`, falls gesetzt, sonst `TAB_Niederspannung_Link`. Filter „VNB-TAB-Ergänzung“ greift bei `TAB_Typ === VNB_Ergaenzung` oder gesetztem Ergänzungslink.

Weitere Stammdaten- und Provenienzfelder: Adresse, Kontakt, `MastrNummer`, `Quelle_*`, `Recherche_Datum`, `Anmerkung`, `Besonderheiten`, Link-Prüffelder.

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

## Daten aktualisieren (MaStR / Enrichment)

### Manuell

CSV unter `public/data/vnb.csv` ersetzen (Semikolon, UTF-8), committen und auf `main` pushen → `deploy-pages.yml` deployed GitHub Pages. Danach den Abschnitt **Datenstand** in diesem README anpassen.

### Automatisch (Refresh-Workflow)

1. Repo-Variable oder Secret `VNB_CSV_URL` auf die URL eines **Slim**-CSV-Exports setzen.
2. Workflow **Refresh VNB data** (`.github/workflows/refresh-data.yml`) manuell starten oder wöchentlich (So 04:00 UTC) laufen lassen.
3. Ohne `VNB_CSV_URL`: No-Op (Job bleibt grün, keine Dateiänderung).

**Wichtig:** Niemals den MaStR-Voll-Dump (~3 GB) oder eine open-mastr-Datenbank ins Repo laden. Nur schlanke Exporte.

Quelle: Markstammdatenregister (MaStR) der BNetzA; Lizenz typischerweise [DL-DE-BY-2.0](https://www.govdata.de/dl-de/by-2-0).