import { DATA_CSV_URL, DATA_JSON_URL } from './config';
import { normalizeVnbRecords, parseCsv } from './parseCsv';
import type { VnbRecord } from './types';

/** Resolve URL against Vite base (import.meta.env.BASE_URL) */
function withBase(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/?$/, '/')}${path.replace(/^\//, '')}`;
}

/**
 * Lädt zuerst JSON (falls vorhanden), sonst CSV.
 * Pfad über src/config.ts änderbar.
 */
export async function loadVnbData(): Promise<VnbRecord[]> {
  const jsonUrl = withBase(DATA_JSON_URL);
  try {
    const res = await fetch(jsonUrl);
    if (res.ok) {
      const data: unknown = await res.json();
      if (Array.isArray(data)) {
        return normalizeVnbRecords(data);
      }
    }
  } catch {
    // JSON optional – weiter mit CSV
  }

  const csvUrl = withBase(DATA_CSV_URL);
  const res = await fetch(csvUrl);
  if (!res.ok) {
    throw new Error(`Daten konnten nicht geladen werden: ${csvUrl} (${res.status})`);
  }
  const text = await res.text();
  return parseCsv(text);
}
