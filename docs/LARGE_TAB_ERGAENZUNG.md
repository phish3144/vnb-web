# Large-VNB TAB-Ergänzungen – Kurzreport

**Datum:** 2026-09-18 (Europe/Berlin)  
**Scope:** `/workspace/vnb/large_vnb_tab_targets.json`  
**Übersprungen:** Gemeindewerk Stelzenberg  
**MITNETZ-Dedup:** nur 1 Eintrag in der Zielliste  
**ÜNB-ähnlich:** keine  
**CSV-Merge:** nicht durchgeführt  

## Ergebnis

| Metrik | n |
|--------|--:|
| Findings-Zeilen | 24 |
| Top-15 bearbeitet | 15 / 15 |
| **VNB_Ergaenzung mit Direktlink** | **13** |
| VNB_Ergaenzung Seite bestätigt, kein Direktlink | 2 |
| Kein Ergänzungslink (BDEW / Leer / Unbekannt) | 9 |

### Gefunden – Direktlink (13)

- **Westnetz GmbH**  
  `https://www.westnetz.de/content/dam/revu-global/westnetz/documents/bauen/ihr-weg-zum-netzanschluss/niederspannung/tab-niederspannung-01092025.pdf`  
  Stand: 01.09.2025 | Status: 200_pdf

- **Avacon Netz GmbH**  
  `https://www.avacon-netz.de/content/dam/revu-global/avacon-netz/documents/Energie_anschliessen/Stromnetz/TAB/Erg%C3%A4nzungen%20Konkretisierungen%20BDEW%20TAB%20Avacon.pdf`  
  Stand: gMSB-Dokument gültig ab 01.08.2025 (Stand 14.07.2025) | Status: 200_pdf

- **EWE NETZ GmbH**  
  `https://www.ewe-netz.de/-/media/ewe-netz/downloads/2024_07_22_ewe_netz_tab-ns.pdf`  
  Stand: 08/2024 | Status: 200_pdf

- **Stromnetz Berlin GmbH**  
  `https://www.stromnetz.berlin/files/globalassets/dokumente/technische-anschlussbedingungen/tab-ns-nord-2023/ergaenzungen_konkretisierungen_tab_ns_nord_2023_v2-0_01-2026.pdf`  
  Stand: Ergänzungen 01-2026 zu TAB NS Nord 2023 v2.0 | Status: 200_pdf

- **RheinNetz GmbH (vormals Rheinische NETZGesellschaft mbH, RNG)**  
  `https://www.rheinnetz.de/tab-niederspannung-rng.pdfx?forced=true`  
  Stand: Ausgabe 09/2026 (TAB 2026 / VDE-AR-N 4100/4105) | Status: 200_pdf

- **enercity Netz GmbH**  
  `https://www.enercity-netz.de/assets/cms/eng/installateure/technische-vorgaben-rundschreiben-protokolle/eNG-Beiblatt_TAB_NS_Nord_2019.pdf`  
  Stand: Beiblatt zur TAB NS Nord 2019 (noch online; enercity-spezifisch) | Status: 200_pdf

- **N-ERGIE Netz GmbH**  
  `https://www.n-ergie-netz.de/public/remotemedien/media/nng/partner_2/installateur_1/info_1/strom_9/N_Erlaeuterungen_Hinweise_Kapitel_7.pdf`  
  Stand: Erläuterungen/Hinweise Kap.7 ab 01.01.2025 (Stand Aug 2025) | Status: inhalt_via_webfetch_ok;_curl_tls_eof

- **SWM Infrastruktur GmbH & Co. KG**  
  `https://www.swm-infrastruktur.de/dam/swm-infrastruktur/dokumente/strom/netzanschluss/swm-hinweise-tab2023.pdf`  
  Stand: Hinweise TAB 2023 Stand 01.07.2024 | Status: 200_pdf

- **Syna GmbH**  
  `https://www.syna.de/content/dam/syna-de/dokumente/netzanschluss/anschlussbedingungen/tab-ns-syna-gmbh.pdf`  
  Stand: gültig ab 01.01.2025 | Status: 200_pdf

- **E.DIS Netz GmbH**  
  `https://www.e-dis-netz.de/content/dam/revu-global/e-dis-netz/dokumente/TAB_1050_022024.pdf`  
  Stand: WN TAB 1050 Stand 01.02.2024 | Status: 200_pdf

- **WEMAG Netz GmbH**  
  `https://www.wemag-netz.de/sites/default/files/2025-12/tab-ns-nord-2023-beiblatt-wemag-netz-gmbh_240515.pdf`  
  Stand: Beiblatt Suffix 240515 zu TAB NS Nord 2023 v2.0 | Status: 200_pdf

- **Pfalzwerke Netz AG**  
  `https://www.pfalzwerke-netz.de/pfalzwerke-netz/downloads/netz-anschliessen/technische_anschlusbedingungen_niederspannung_2025.pdf`  
  Stand: Version 2.1 Januar 2025 | Status: 200_pdf

- **Netz Leipzig GmbH**  
  `https://files.l.de/lde-typo3/Netz/Downloads/Netzanschluss/Strom/Ergaenzung_der_Technischen_Anschlussbedingungen_2023_V2.0_der_Netz_Leipzig_GmbH.pdf`  
  Stand: Ergänzung Stand 01.09.2024 | Status: 200_pdf

### Ergänzung bestätigt, Direktlink fehlt (2)

- **MITNETZ STROM (Mitteldeutsche Netzgesellschaft Strom mbH)** — Seite listet „Anlage 1 – Ergänzung zur TAB 2023 v2.0 … Technische Richtlinie Direkt- und Wandlermessungen“ sowie Umsetzungshilfen. Direkte Media-PDFs hier per TLS nicht ladbar → kein erfundener Direktlink. Kein MITNETZ-Doppel in der Zielliste.

- **Hamburger Energienetze GmbH (Marke: Stromnetz Hamburg)** — Seite bestätigt: TAB NS Nord 2023 gilt zusammen mit Beiblatt. AdmiralCloud-Direktlink des Beiblatts aus HTML nicht extrahierbar (WAF). Kein erfundener UUID.

### Nicht als VNB-Ergänzung gewertet (9)

- **Bayernwerk Netz GmbH** (`BDEW_Muster`) — Elektrotechniker-Broschüre erwähnt Ergänzungen nach EnWG §19 Abs.1a, aber kein separates Ergänzungs-PDF gefunden; veröffentlicht wird der BDEW-Musterwortlaut.
- **Schleswig-Holstein Netz GmbH (SH Netz)** (`BDEW_Muster`) — Rundschreiben 2/2024: TAB NS Nord 2023 v2.0 ersetzt frühere Fassung inkl. SH-Netz-Beiblatt/technischer Ergänzungen. Kein aktuelles separates Ergänzungsdokument.
- **LEW Verteilnetz GmbH** (`BDEW_Muster`) — TAB-PDF = reiner BDEW-Bundesmusterwortlaut. Gehostete Hinweise sind VBEW-Verbandshinweise → keine VNB-eigene Ergänzung.
- **Emscher Lippe Energie GmbH (ELE) / ELE Verteilnetz GmbH** (`Unbekannt`) — Kein separates TAB-Ergänzungsdokument in dieser Recherche verifiziert.
- **VSE Verteilnetz GmbH** (`Leer`) — In Targets TAB leer; kein Ergänzungslink verifiziert.
- **energis-Netzgesellschaft mbH** (`Unbekannt`) — Ergänzende Bedingungen zur NAV gefunden, kein TAB-Beiblatt verifiziert.
- **SachsenNetze GmbH (ehem. DREWAG NETZ GmbH)** (`Leer`) — Technische-Anforderungen-Seite vorhanden; kein stabiler Ergänzungs-PDF-Link in dieser Pass.
- **Thüga Energienetze GmbH** (`Unbekannt`) — Kein separates Ergänzungsdokument gefunden.
- **TWL-Verteilnetz GmbH** (`Leer`) — Kein TAB-/Ergänzungslink verifiziert (nicht mit TWL Netze Ludwigshafen verwechseln).


## Top-15

| VNB | Typ | Erg.-Link |
|-----|-----|-----------|
| Westnetz GmbH | VNB_Ergaenzung | ja |
| Bayernwerk Netz GmbH | BDEW_Muster | nein |
| Avacon Netz GmbH | VNB_Ergaenzung | ja |
| EWE NETZ GmbH | VNB_Ergaenzung | ja |
| MITNETZ STROM | VNB_Ergaenzung | Seite |
| Stromnetz Berlin GmbH | VNB_Ergaenzung | ja |
| Hamburger Energienetze GmbH | VNB_Ergaenzung | Seite |
| Schleswig-Holstein Netz GmbH | BDEW_Muster | nein |
| LEW Verteilnetz GmbH | BDEW_Muster | nein |
| RheinNetz GmbH | VNB_Ergaenzung | ja |
| enercity Netz GmbH | VNB_Ergaenzung | ja |
| N-ERGIE Netz GmbH | VNB_Ergaenzung | ja |
| SWM Infrastruktur GmbH & Co. KG | VNB_Ergaenzung | ja |
| Syna GmbH | VNB_Ergaenzung | ja |
| E.DIS Netz GmbH | VNB_Ergaenzung | ja |


## Hinweise

- Westnetz / EWE / Syna / RheinNetz / Pfalzwerke: VNB-TAB-PDF **ist** die Ergänzung zum Muster.
- Avacon-PDF „Ergänzungen…“ = gMSB-Zählerplatzbedingungen mit TAB-Bezug.
- Bayernwerk: Broschüre erwähnt Ergänzungen, separates PDF nicht gefunden.
- SH Netz: Beiblatt laut Rundschreiben 2/2024 durch TAB NS Nord 2023 v2.0 ersetzt.
- LEW: nur VBEW-Verbandshinweise, keine LEW-eigene Ergänzung.
- MITNETZ / N-ERGIE: Inhalte bestätigt; TLS-Probleme beim Direkt-Download aus der Box.
- Hamburg: Beiblatt auf Seite bestätigt; AdmiralCloud-UUID nicht extrahierbar → kein erfundener Link.
- enercity-Beiblatt noch Stand TAB NS Nord **2019**.

## Dateien

- `/workspace/vnb/large_tab_findings.jsonl`
- `/workspace/vnb/large_tab_ergaenzung_report.md`
