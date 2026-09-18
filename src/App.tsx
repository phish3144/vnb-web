import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { filterRecords } from './filter';
import { loadVnbData } from './loadData';
import type { Filters, VnbRecord } from './types';
import { EMPTY_FILTERS } from './types';
import { FilterBar } from './components/FilterBar';
import { ResultTable } from './components/ResultTable';
import { distinctTabTypen } from './utils';
import {
  applyAllOverrides,
  clearOverrideForKey,
  downloadOverrides,
  loadOverrides,
  mergeOverrides,
  overrideCount,
  parseOverridesJson,
  recordKey,
  saveOverrides,
  setFieldOverride,
  type OverrideField,
  type OverridesMap,
} from './overrides';

export default function App() {
  const [baseRecords, setBaseRecords] = useState<VnbRecord[]>([]);
  const [overrides, setOverrides] = useState<OverridesMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOverrides(loadOverrides());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadVnbData();
        if (!cancelled) {
          setBaseRecords(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((updater: OverridesMap | ((prev: OverridesMap) => OverridesMap)) => {
    setOverrides((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveOverrides(next);
      return next;
    });
  }, []);

  const records = useMemo(
    () => applyAllOverrides(baseRecords, overrides),
    [baseRecords, overrides],
  );

  const baseByKey = useMemo(() => {
    const m = new Map<string, VnbRecord>();
    for (const r of baseRecords) {
      m.set(recordKey(r), r);
    }
    return m;
  }, [baseRecords]);

  const filtered = useMemo(
    () => filterRecords(records, filters),
    [records, filters],
  );

  const tabTypen = useMemo(() => distinctTabTypen(records), [records]);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const handleFieldChange = useCallback(
    (key: string, field: OverrideField, value: string) => {
      const base = baseByKey.get(key);
      const baseValue = base ? base[field] : '';
      persist((prev) => setFieldOverride(prev, key, field, value, baseValue));
    },
    [baseByKey, persist],
  );

  const handleResetRow = useCallback(
    (key: string) => {
      persist((prev) => clearOverrideForKey(prev, key));
    },
    [persist],
  );

  const handleExport = () => {
    downloadOverrides(overrides);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const incoming = parseOverridesJson(text);
      const n = overrideCount(incoming);
      const doMerge = window.confirm(
        `Import: ${n} Einträg${n === 1 ? '' : 'e'}.\n\n` +
          'OK = zusammenführen (Merge, empfohlen)\n' +
          'Abbrechen = Dialog schließen ohne Import\n\n' +
          'Tipp: Für komplettes Ersetzen zuerst „Alle zurücksetzen“, dann Import.',
      );
      if (doMerge) {
        persist((prev) => mergeOverrides(prev, incoming));
      }
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : 'Import fehlgeschlagen',
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetAll = () => {
    setOverrides((prev) => {
      const n = overrideCount(prev);
      if (n === 0) return prev;
      if (
        !window.confirm(
          `Alle ${n} lokalen Overrides unwiderruflich löschen?`,
        )
      ) {
        return prev;
      }
      saveOverrides({});
      return {};
    });
  };

  const ovCount = overrideCount(overrides);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1>VNB-Suche</h1>
          <p className="subtitle">
            Verteilnetzbetreiber (Deutschland) – lokale Suche in Stammdaten
          </p>
        </div>
      </header>

      <main className="main">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          tabTypen={tabTypen}
        />

        <section className="overrides-bar" aria-label="Lokale Overrides">
          <div className="overrides-info">
            <strong>Lokale Overrides</strong>
            <span className="muted">
              {ovCount === 0
                ? 'keine gespeichert'
                : `${ovCount} Einträg${ovCount === 1 ? '' : 'e'} in localStorage`}
            </span>
            <span className="hint-inline">
              Import führt zusammen (Merge). Für Replace: zuerst alle zurücksetzen. Nur im Browser.
            </span>
          </div>
          <div className="overrides-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExport}
              disabled={ovCount === 0}
            >
              Export JSON
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleImportClick}
            >
              Import JSON
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleResetAll}
              disabled={ovCount === 0}
            >
              Alle zurücksetzen
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="visually-hidden"
              onChange={(e) => handleImportFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </section>

        <section className="results-meta" aria-live="polite">
          {loading && <span>Daten werden geladen…</span>}
          {error && <span className="error">{error}</span>}
          {!loading && !error && (
            <span>
              <strong>{filtered.length}</strong> von{' '}
              <strong>{records.length}</strong> Einträgen
            </span>
          )}
        </section>

        {!loading && !error && (
          <ResultTable
            records={filtered}
            baseByKey={baseByKey}
            overrides={overrides}
            onFieldChange={handleFieldChange}
            onResetRow={handleResetRow}
          />
        )}
      </main>

      <footer className="footer">
        <span>
          Clientseitige Filterung · Overrides nur lokal (localStorage) · keine
          Backend-Anbindung
        </span>
      </footer>
    </div>
  );
}
