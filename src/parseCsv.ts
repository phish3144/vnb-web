import type { VnbRecord } from './types';

const FIELDS: (keyof VnbRecord)[] = [
  'Name',
  'Rechtsform',
  'Strasse',
  'PLZ',
  'Ort',
  'Bundesland',
  'Telefon',
  'Email',
  'Website',
  'TAB_Niederspannung_Link',
  'TAB_Stand',
  'Anmeldeportal',
  'Quelle',
  'Recherche_Datum',
  'Anmerkung',
  'MastrNummer',
  'TAB_Typ',
  'TAB_Ergaenzung_Link',
  'Planauskunft_Link',
  'Link_geprueft',
  'Link_Status',
  'Quelle_Stammdaten',
  'Quelle_TAB',
  'Quelle_Portal',
  'Quelle_Planauskunft',
  'Besonderheiten',
];

/** Strip UTF-8 BOM if present */
function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Parse semicolon-separated CSV with quoted fields (RFC-ish).
 * Handles "" escapes and newlines inside quotes.
 * Missing columns in the header → empty string (no crash).
 */
export function parseCsv(text: string): VnbRecord[] {
  const raw = stripBom(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = splitCsvRows(raw, ';');
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim());
  const fieldIndex = FIELDS.map((f) => header.indexOf(f));

  const records: VnbRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length === 1 && cols[0].trim() === '') continue;
    const rec = {} as VnbRecord;
    for (let j = 0; j < FIELDS.length; j++) {
      const idx = fieldIndex[j];
      rec[FIELDS[j]] = idx >= 0 && idx < cols.length ? cols[idx].trim() : '';
    }
    records.push(rec);
  }
  return records;
}

function splitCsvRows(text: string, sep: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === sep) {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function normalizeVnbRecords(data: unknown[]): VnbRecord[] {
  return data.map((item) => {
    const o = (item ?? {}) as Record<string, unknown>;
    const rec = {} as VnbRecord;
    for (const f of FIELDS) {
      const v = o[f];
      rec[f] = v == null ? '' : String(v).trim();
    }
    return rec;
  });
}
