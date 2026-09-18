import type { Filters, PresenceFilter, VnbRecord } from './types';

/** n/a und leere Werte gelten als fehlend */
export function isMissing(value: string | undefined | null): boolean {
  if (value == null) return true;
  const v = value.trim();
  if (v === '') return true;
  const lower = v.toLowerCase();
  return lower === 'n/a' || lower === 'na' || lower === '-';
}

export function isPresent(value: string | undefined | null): boolean {
  return !isMissing(value);
}

function includesCI(haystack: string, needle: string): boolean {
  if (!needle.trim()) return true;
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

function matchPresence(
  value: string,
  mode: PresenceFilter,
  freeText: string,
): boolean {
  if (mode === 'has' && isMissing(value)) return false;
  if (mode === 'missing' && isPresent(value)) return false;
  if (freeText.trim() && isPresent(value) && !includesCI(value, freeText)) {
    return false;
  }
  // Bei "missing" + Freitext: Freitext ignorieren (kein Wert zum Suchen)
  if (freeText.trim() && mode === 'any' && isMissing(value)) return false;
  if (freeText.trim() && mode === 'has' && !includesCI(value, freeText)) return false;
  return true;
}

/** Bundesland-Feld kann mehrere Codes enthalten: "BB, MV" */
function matchesBundesland(field: string, selected: string[]): boolean {
  if (selected.length === 0) return true;
  if (isMissing(field)) return false;
  const codes = field
    .split(/[,;/|\s]+/)
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  return selected.some((s) => codes.includes(s.toUpperCase()));
}

const QUICK_FIELDS: (keyof VnbRecord)[] = [
  'Name',
  'Ort',
  'PLZ',
  'Bundesland',
  'Strasse',
  'Website',
  'Email',
  'Telefon',
  'TAB_Niederspannung_Link',
  'Anmeldeportal',
  'Anmerkung',
  'Rechtsform',
];

export function matchesFilters(rec: VnbRecord, f: Filters): boolean {
  if (f.name && !includesCI(rec.Name, f.name)) return false;
  if (f.ort && !includesCI(rec.Ort, f.ort)) return false;
  if (f.plz && !includesCI(rec.PLZ, f.plz)) return false;
  if (!matchesBundesland(rec.Bundesland, f.bundeslaender)) return false;

  if (!matchPresence(rec.Website, f.website, f.websiteText)) return false;
  if (!matchPresence(rec.TAB_Niederspannung_Link, f.tab, f.tabText)) return false;
  if (!matchPresence(rec.Anmeldeportal, f.anmeldeportal, f.anmeldeportalText)) {
    return false;
  }

  if (f.quick.trim()) {
    const q = f.quick.trim().toLowerCase();
    const hit = QUICK_FIELDS.some((key) => {
      const v = rec[key];
      return isPresent(v) && v.toLowerCase().includes(q);
    });
    if (!hit) return false;
  }

  return true;
}

export function filterRecords(records: VnbRecord[], f: Filters): VnbRecord[] {
  return records.filter((r) => matchesFilters(r, f));
}
