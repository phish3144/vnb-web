export interface VnbRecord {
  Name: string;
  Rechtsform: string;
  Strasse: string;
  PLZ: string;
  Ort: string;
  Bundesland: string;
  Telefon: string;
  Email: string;
  Website: string;
  TAB_Niederspannung_Link: string;
  TAB_Stand: string;
  Anmeldeportal: string;
  Quelle: string;
  Recherche_Datum: string;
  Anmerkung: string;
  /** Optional – fehlt ggf. in älteren CSVs */
  MastrNummer: string;
  TAB_Typ: string;
  TAB_Ergaenzung_Link: string;
  Planauskunft_Link: string;
  Link_geprueft: string;
  Link_Status: string;
  /** Provenienz (optional) */
  Quelle_Stammdaten: string;
  Quelle_TAB: string;
  Quelle_Portal: string;
  Quelle_Planauskunft: string;
  /** Freitext-Besonderheiten (CSV optional + lokal überschreibbar) */
  Besonderheiten: string;
}

export type PresenceFilter = 'any' | 'has' | 'missing';

export interface Filters {
  name: string;
  ort: string;
  plz: string;
  bundeslaender: string[];
  website: PresenceFilter;
  websiteText: string;
  tab: PresenceFilter;
  tabText: string;
  anmeldeportal: PresenceFilter;
  anmeldeportalText: string;
  /** VNB_Ergaenzung bzw. eigener TAB-Ergänzungslink */
  hatVnbTabErgaenzung: PresenceFilter;
  /** Optionaler Filter nach TAB_Typ (exakter Wert oder leer = alle) */
  tabTyp: string;
  /** Filter: hat Besonderheiten */
  hatBesonderheiten: PresenceFilter;
  quick: string;
}

export const EMPTY_FILTERS: Filters = {
  name: '',
  ort: '',
  plz: '',
  bundeslaender: [],
  website: 'any',
  websiteText: '',
  tab: 'any',
  tabText: '',
  anmeldeportal: 'any',
  anmeldeportalText: '',
  hatVnbTabErgaenzung: 'any',
  tabTyp: '',
  hatBesonderheiten: 'any',
  quick: '',
};

/** Alle deutschen Bundesland-Kürzel (für Filter-UI) */
export const BUNDESLAENDER: { code: string; name: string }[] = [
  { code: 'BW', name: 'Baden-Württemberg' },
  { code: 'BY', name: 'Bayern' },
  { code: 'BE', name: 'Berlin' },
  { code: 'BB', name: 'Brandenburg' },
  { code: 'HB', name: 'Bremen' },
  { code: 'HH', name: 'Hamburg' },
  { code: 'HE', name: 'Hessen' },
  { code: 'MV', name: 'Mecklenburg-Vorpommern' },
  { code: 'NI', name: 'Niedersachsen' },
  { code: 'NW', name: 'Nordrhein-Westfalen' },
  { code: 'RP', name: 'Rheinland-Pfalz' },
  { code: 'SL', name: 'Saarland' },
  { code: 'SN', name: 'Sachsen' },
  { code: 'ST', name: 'Sachsen-Anhalt' },
  { code: 'SH', name: 'Schleswig-Holstein' },
  { code: 'TH', name: 'Thüringen' },
];
