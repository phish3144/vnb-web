import { isMissing, isPresent, primaryTabLink } from './filter';
import type { VnbRecord } from './types';

export function displayValue(value: string): string {
  return isMissing(value) ? '—' : value;
}

export function looksLikeUrl(value: string): boolean {
  if (isMissing(value)) return false;
  const v = value.trim();
  return /^https?:\/\//i.test(v) || /^www\./i.test(v);
}

export function toHref(value: string): string {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\./i.test(v)) return `https://${v}`;
  return v;
}

/** Extrahiert klickbare URLs aus gemischtem Text (erste URL oder ganzer Wert) */
export function extractUrls(value: string): string[] {
  if (isMissing(value)) return [];
  const matches = value.match(/https?:\/\/[^\s),;]+/gi);
  return matches ?? (looksLikeUrl(value) ? [value.trim()] : []);
}

/**
 * BDEW-only / reine Muster-Einträge – visuell abschwächen, nicht ausblenden.
 */
export function isBdewOrMusterOnly(rec: VnbRecord): boolean {
  const typ = (rec.TAB_Typ ?? '').trim().toLowerCase();
  if (typ.includes('bdew') || typ.includes('muster')) return true;

  const note = (rec.Anmerkung ?? '').toLowerCase();
  if (
    /\bmuster\b/.test(note) ||
    /\bbdew\b/.test(note) ||
    note.includes('reine muster') ||
    note.includes('nur muster') ||
    note.includes('bdew-only') ||
    note.includes('bdew only')
  ) {
    return true;
  }

  return false;
}

/** Distinct, non-empty TAB_Typ values sorted */
export function distinctTabTypen(records: VnbRecord[]): string[] {
  const set = new Set<string>();
  for (const r of records) {
    const t = (r.TAB_Typ ?? '').trim();
    if (t && !isMissing(t)) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'de'));
}

export { isMissing, isPresent, primaryTabLink };
