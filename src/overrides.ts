import type { VnbRecord } from './types';

/** Felder, die lokal überschrieben werden können */
export const OVERRIDE_FIELDS = [
  'Website',
  'TAB_Niederspannung_Link',
  'TAB_Ergaenzung_Link',
  'Anmeldeportal',
  'Planauskunft_Link',
  'Telefon',
  'Email',
  'Besonderheiten',
] as const;

export type OverrideField = (typeof OVERRIDE_FIELDS)[number];

export type RecordOverride = Partial<Pick<VnbRecord, OverrideField>>;

/** Alle Overrides: Key → Teilfelder */
export type OverridesMap = Record<string, RecordOverride>;

const STORAGE_KEY = 'vnb-web-overrides-v1';

/** Stabiler Schlüssel pro Datensatz */
export function recordKey(rec: Pick<VnbRecord, 'MastrNummer' | 'Name' | 'Ort'>): string {
  const mastr = (rec.MastrNummer ?? '').trim();
  if (mastr) return mastr;
  return `${(rec.Name ?? '').trim()}|${(rec.Ort ?? '').trim()}`;
}

export function loadOverrides(): OverridesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return sanitizeMap(parsed as Record<string, unknown>);
  } catch {
    return {};
  }
}

function sanitizeMap(obj: Record<string, unknown>): OverridesMap {
  const out: OverridesMap = {};
  for (const [key, val] of Object.entries(obj)) {
    if (!key || !val || typeof val !== 'object' || Array.isArray(val)) continue;
    const clean: RecordOverride = {};
    const rec = val as Record<string, unknown>;
    for (const f of OVERRIDE_FIELDS) {
      if (f in rec && rec[f] != null) {
        clean[f] = String(rec[f]);
      }
    }
    if (Object.keys(clean).length > 0) out[key] = clean;
  }
  return out;
}

export function saveOverrides(map: OverridesMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function hasOverrideFor(
  map: OverridesMap,
  rec: Pick<VnbRecord, 'MastrNummer' | 'Name' | 'Ort'>,
): boolean {
  const o = map[recordKey(rec)];
  return !!o && Object.keys(o).length > 0;
}

/** CSV-Zeile + Override mergen; Override gewinnt */
export function applyOverride(rec: VnbRecord, map: OverridesMap): VnbRecord {
  const o = map[recordKey(rec)];
  if (!o || Object.keys(o).length === 0) return rec;
  return { ...rec, ...o };
}

export function applyAllOverrides(
  records: VnbRecord[],
  map: OverridesMap,
): VnbRecord[] {
  if (Object.keys(map).length === 0) return records;
  return records.map((r) => applyOverride(r, map));
}

export function setFieldOverride(
  map: OverridesMap,
  key: string,
  field: OverrideField,
  value: string,
  baseValue: string,
): OverridesMap {
  const next = { ...map };
  const current = { ...(next[key] ?? {}) };
  // Wenn Wert dem CSV-Basiswert entspricht: Override-Eintrag entfernen
  if (value === baseValue) {
    delete current[field];
  } else {
    current[field] = value;
  }
  if (Object.keys(current).length === 0) {
    delete next[key];
  } else {
    next[key] = current;
  }
  return next;
}

export function clearOverrideForKey(map: OverridesMap, key: string): OverridesMap {
  if (!(key in map)) return map;
  const next = { ...map };
  delete next[key];
  return next;
}

export function mergeOverrides(
  existing: OverridesMap,
  incoming: OverridesMap,
): OverridesMap {
  const next: OverridesMap = { ...existing };
  for (const [key, ov] of Object.entries(incoming)) {
    next[key] = { ...(next[key] ?? {}), ...ov };
  }
  return next;
}

export function exportOverridesJson(map: OverridesMap): string {
  return JSON.stringify(map, null, 2);
}

export function parseOverridesJson(text: string): OverridesMap {
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Ungültiges Override-JSON (Objekt erwartet)');
  }
  return sanitizeMap(parsed as Record<string, unknown>);
}

export function downloadOverrides(map: OverridesMap): void {
  const blob = new Blob([exportOverridesJson(map)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vnb-overrides-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function overrideCount(map: OverridesMap): number {
  return Object.keys(map).length;
}
