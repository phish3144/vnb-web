# VNB Enrichment Report

**Date:** 2026-09-18 (Europe/Berlin)

## Method

- MaStR Gesamtdatenexport ZIP via open-mastr download path, then custom XML parse of Marktakteure + Rollen (grid_connections skipped — too large).
- Marktakteur JSON list endpoints: 404. SOAP not used.
- **No TAB scrape** this pass.

## Filter

1. Marktfunktion=1 (Stromnetzbetreiber) / MastrNummer prefix SNB → **938** actors.
2. All have Rolle Anschlussnetzbetreiber after role join.
3. ÜNBs also carrying AN kept and flagged in Anmerkung.
4. Match: light-normalized exact name + fuzzy token_set_ratio ≥88 (ort-assisted).

## Counts

| Metric | Count |
|--------|------:|
| Partial before | 513 |
| MaStR SNB | 938 |
| Matched | 475 (92.6%) |
| Unmatched partial | 38 |
| Added from MaStR | 468 |
| Duplicate MastrNummer (flagged, kept) | 5 |
| **Output after** | **981** |

### Match methods

- match_exact_name: 397
- match_exact_name_fuzzy_ort: 3
- match_exact_name_ort: 1
- match_fuzzy: 68
- match_fuzzy_ort: 6

### Newly filled from MaStR

- Strasse: 206
- PLZ: 210
- Telefon: 216
- Email: 245
- Website: 188
- Rechtsform: 55

## Completeness (all 981 rows)

| Field | Filled | Missing | Fill % |
|-------|--------|---------|--------|
| Strasse | 972 | 9 | 99.1% |
| PLZ | 971 | 10 | 99.0% |
| Ort | 981 | 0 | 100.0% |
| Telefon | 967 | 14 | 98.6% |
| Email | 960 | 21 | 97.9% |
| Website | 951 | 30 | 96.9% |
| MastrNummer | 943 | 38 | 96.1% |
| TAB_Niederspannung_Link | 205 | 776 | 20.9% |
| Anmeldeportal | 120 | 861 | 12.2% |
| Planauskunft_Link | 2 | 979 | 0.2% |

## Completeness (partial-origin 513)

| Field | Filled | Missing | Fill % |
|-------|--------|---------|--------|
| Strasse | 504 | 9 | 98.2% |
| PLZ | 503 | 10 | 98.1% |
| Ort | 513 | 0 | 100.0% |
| Telefon | 503 | 10 | 98.1% |
| Email | 495 | 18 | 96.5% |
| Website | 499 | 14 | 97.3% |
| MastrNummer | 475 | 38 | 92.6% |
| TAB_Niederspannung_Link | 205 | 308 | 40.0% |
| Anmeldeportal | 120 | 393 | 23.4% |
| Planauskunft_Link | 2 | 511 | 0.4% |

## TAB_Typ

- `Leer`: **776**
- `Unbekannt`: **122**
- `BDEW_Muster`: **63**
- `VNB_Ergaenzung`: **15**
- `Regional`: **5**

- **BDEW_Muster: 63**
- TAB_Ergaenzung_Link / Link_*: n/a (no scrape).

## Gaps

- TAB/Portal research not done.
- 38 unmatched partial rows (see Anmerkung).
- 5 MastrNummer duplicates flagged.
- MaStR contact fields often redacted.

## Files

- `/workspace/vnb/vnb_complete.csv`
- `/workspace/vnb/vnb_complete.json`
- `/workspace/vnb/REPORT.md`
- `/workspace/vnb/mastr_export/mastr_stromnetzbetreiber.json`

## TAB Pass (2026-09-18, Europe/Berlin)

### Ziel
VNB-spezifische TAB / Zusatzbestimmungen / Abweichungen vom BDEW-Bundesmuster finden und klassifizieren; Anmeldeportal vs Planauskunft trennen; Provenance-Spalten setzen. Keine erfundenen URLs.

### Methode
1. Bestehende `TAB_Niederspannung_Link` per HTTP (HEAD/GET) geprüft und per URL-Muster reklassifiziert.
2. Curated Updates (u.a. MITNETZ Seitelink, ThügaNETZE PDF+Portal, Gelsenwasser TAB+Ergänzung, Feucht/GWS/GNF BDEW+VBEW, Rosenheim Netze, badenova Regional).
3. Website-Scan (~90 priorisierte Leer/Unbekannt) mit Pfadheuristik; danach Cleanup gegen NAV/NDAV/Gas/§14a-Falschtreffer; kurze Welle-2 für große Leer-VNBs.
4. Neue Spalten: `Quelle_Stammdaten`, `Quelle_TAB`, `Quelle_Portal`, `Quelle_Planauskunft` — bestehende `Quelle` unverändert.
5. `Recherche_Datum` / `Link_geprueft` = 2026-09-18 wo angefasst; `Link_Status` ∈ {ok, tot, seite_ohne_pdf}.

### TAB_Typ vor → nach

| Typ | Vorher | Nachher |
|-----|-------:|--------:|
| Leer | 776 | 753 |
| Unbekannt | 122 | 127 |
| BDEW_Muster | 63 | 69 |
| VNB_Ergaenzung | 15 | 25 |
| Regional | 5 | 7 |

### Füllgrade (echte http(s)-URLs)

| Feld | Vorher | Nachher | Δ |
|------|-------:|--------:|--:|
| TAB_Niederspannung_Link | 134 | 152 | +18 |
| TAB_Ergaenzung_Link | 0 | 39 | +39 |
| Anmeldeportal | 27 | 73 | +46 |
| Planauskunft_Link | 1 | 42 | +41 |
| Website | — | 951 | — |
| Quelle_TAB (gesetzt) | 0 | 152 | — |
| Quelle_Portal | 0 | 62 | — |
| Quelle_Planauskunft | 0 | 42 | — |
| Quelle_Stammdaten | 0 | 981 | — |

### Link-Status / Aktivität
- Links geprüft (Pass): **167** (Status-Snapshot: {'ok': 154, 'tot': 11, 'seite_ohne_pdf': 2})
- Aktueller `Link_Status`-Bestand: {'ok': 142, 'seite_ohne_pdf': 2, 'tot': 8}
- Neue / gesetzte `TAB_Ergaenzung_Link`: **39** (vorher 0)
- Verbleibend **Leer mit Website**: **723**

### Klassifikation
- **BDEW_Muster**: Bundesmuster / TAB NS Nord / klare BDEW-Dateinamen — URL **nicht** in `TAB_Ergaenzung_Link`.
- **VNB_Ergaenzung**: echte Ergänzungen / Erläuterungen / Beiblätter / Zusatzbestimmungen → zusätzlich `TAB_Ergaenzung_Link`.
- **Regional**: z.B. Westnetz-eigene TAB, E.DIS, VBEW-Hinweise, TAB Baden-Württemberg (badenova).
- Unsicher / 403/JS → **Unbekannt** + Anmerkung; tot → `Link_Status=tot`.

### Lücken / Blocker
- ~723 Zeilen weiterhin Leer trotz Website (viele kleine Gemeindewerke, JS/403, keine öffentliche TAB-PDF).
- MITNETZ: nur Seitelink (`seite_ohne_pdf`) — Direkt-PDF hinter JS/SSL.
- Einige historische TAB-Links tot (u.a. swa Netze, ESTW, N-ERGIE Alt-Pfad, Stuttgart Netze Filershare, BS|NETZ, enwor, NGN, SWT Trier) — in Anmerkung markiert.
- NAV-/NDAV-/Gas-/§14a-Dokumente bewusst wieder entfernt, wo fälschlich als TAB erkannt.

### Wie aktualisieren

1. **Stammdaten (MaStR)**  
   - Neuen Gesamtdatenexport laden.  
   - Skript: `enrich_vnb.py` → Spalten Name/Adresse/Kontakt/Website/MastrNummer, `Quelle` / später `Quelle_Stammdaten`.  
   - Backup vor TAB: `cp vnb_complete.csv vnb_complete_pre_tab.csv`.

2. **TAB-Pass**  
   - Skript: `tab_final.py` (+ optional Cleanup/Welle-2-Logik).  
   - Schreibt `TAB_*`, Portale, `Link_*`, Provenance `Quelle_TAB|_Portal|_Planauskunft`, `Recherche_Datum`.  
   - Curated-Block im Skript erweitern, wenn Crawler bei großen VNBs scheitert.

3. **Manuell (hoher Nutzen)**  
   - `TAB_Typ=Leer` + bekannte große Website.  
   - `Link_Status=tot` oder `seite_ohne_pdf`.  
   - BDEW_Muster ohne `TAB_Ergaenzung_Link` → lokale Zusatzbestimmungen suchen.  
   - Portale streng trennen: Anmeldung/Installateur → `Anmeldeportal`; GIS/Leitung → `Planauskunft_Link`.

4. **Qualität**  
   - Keine URL ohne HTTP-Check.  
   - bdew.de-Bundesmuster nicht als VNB-Ergänzung.  
   - `REPORT.md`, `tab_pass_summary.json`, `tab_pass_log.jsonl` mitführen.

### Dateien
- `/workspace/vnb/vnb_complete.csv` / `vnb_complete.json` (überschrieben, inkl. Provenance-Spalten)
- `/workspace/vnb/vnb_complete_pre_tab.csv` (Backup vor TAB-Pass)
- `/workspace/vnb/tab_pass_summary.json`, `tab_pass_log.jsonl`
- Skripte: `tab_final.py`, `enrich_vnb.py`
