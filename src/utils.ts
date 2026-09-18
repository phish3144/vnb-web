import { isMissing, isPresent } from './filter';

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

export { isMissing, isPresent };
