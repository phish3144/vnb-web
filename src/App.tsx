import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterRecords } from './filter';
import { loadVnbData } from './loadData';
import type { Filters, VnbRecord } from './types';
import { EMPTY_FILTERS } from './types';
import { SearchBar } from './components/SearchBar';
import { AdvancedFilters } from './components/AdvancedFilters';
import { OverridesToolbar } from './components/OverridesToolbar';
import { ResultList } from './components/ResultList';
import { DetailSheet } from './components/DetailSheet';
import { distinctTabTypen } from './utils';
import { useTheme } from './hooks/useTheme';
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
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const { resolved, toggle } = useTheme();

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

  const persist = useCallback(
    (updater: OverridesMap | ((prev: OverridesMap) => OverridesMap)) => {
      setOverrides((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveOverrides(next);
        return next;
      });
    },
    [],
  );

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

  const selectedRecord = useMemo(() => {
    if (!selectedKey) return null;
    return filtered.find((r) => recordKey(r) === selectedKey) ?? null;
  }, [filtered, selectedKey]);

  // Close detail if selection drops out of filtered set
  useEffect(() => {
    if (selectedKey && !selectedRecord) setSelectedKey(null);
  }, [selectedKey, selectedRecord]);

  const tabTypen = useMemo(() => distinctTabTypen(records), [records]);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const handleQuickChange = useCallback((quick: string) => {
    setFilters((prev) => ({ ...prev, quick }));
  }, []);

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
  const highlightQuery = filters.quick.trim() || filters.name.trim();

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-top">
            <h1>VNB-Suche</h1>
            <button
              type="button"
              className="btn btn-theme"
              onClick={toggle}
              title={
                resolved === 'dark'
                  ? 'Hellmodus aktivieren'
                  : 'Dunkelmodus aktivieren'
              }
              aria-label={
                resolved === 'dark' ? 'Hellmodus' : 'Dunkelmodus'
              }
            >
              {resolved === 'dark' ? '☀' : '☾'}
            </button>
          </div>
          <p className="subtitle">
            Verteilnetzbetreiber (Deutschland) – lokale Suche in Stammdaten
          </p>
        </div>
      </header>

      <main className="main">
        <SearchBar
          value={filters.quick}
          onChange={handleQuickChange}
          resultCount={loading || error ? undefined : filtered.length}
          totalCount={loading || error ? undefined : records.length}
        />

        <AdvancedFilters
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          tabTypen={tabTypen}
        />

        <OverridesToolbar
          count={ovCount}
          onExport={handleExport}
          onImportFile={handleImportFile}
          onResetAll={handleResetAll}
        />

        <section className="results-meta" aria-live="polite">
          {loading && <span>Daten werden geladen…</span>}
          {error && <span className="error">{error}</span>}
        </section>

        {!loading && !error && (
          <ResultList
            records={filtered}
            overrides={overrides}
            selectedKey={selectedKey}
            highlightQuery={highlightQuery}
            onSelect={(key) =>
              setSelectedKey((prev) => (prev === key ? null : key))
            }
            onResetFilters={resetFilters}
          />
        )}
      </main>

      <DetailSheet
        rec={selectedRecord}
        baseByKey={baseByKey}
        overrides={overrides}
        onClose={() => setSelectedKey(null)}
        onFieldChange={handleFieldChange}
        onResetRow={handleResetRow}
      />

      <footer className="footer">
        <span>
          Clientseitige Filterung · Overrides nur lokal (localStorage) · keine
          Backend-Anbindung
        </span>
      </footer>
    </div>
  );
}
