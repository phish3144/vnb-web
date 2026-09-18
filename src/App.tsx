import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterRecords } from './filter';
import { loadVnbData } from './loadData';
import type { Filters, VnbRecord } from './types';
import { EMPTY_FILTERS } from './types';
import { SearchBar } from './components/SearchBar';
import { ResultList } from './components/ResultList';
import { DetailSheet } from './components/DetailSheet';
import { ToolsPanel } from './components/ToolsPanel';
import { countActiveAdvanced } from './components/AdvancedFilters';
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
  const [toolsOpen, setToolsOpen] = useState(false);
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
      window.alert(e instanceof Error ? e.message : 'Import fehlgeschlagen');
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
  const advancedCount = countActiveAdvanced(filters);
  const highlightQuery = filters.quick.trim() || filters.name.trim();
  const toolsBadge = advancedCount + (ovCount > 0 ? 1 : 0);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <h1>VNB-Suche</h1>
            <p className="subtitle">Verteilnetzbetreiber · Deutschland</p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="btn btn-icon"
              onClick={() => setToolsOpen(true)}
              title="Mehr Filter & Overrides"
              aria-label="Werkzeuge öffnen"
            >
              <span aria-hidden>⚙</span>
              {toolsBadge > 0 ? (
                <span className="header-badge" aria-hidden>
                  {toolsBadge > 9 ? '9+' : toolsBadge}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="btn btn-icon"
              onClick={toggle}
              title={
                resolved === 'dark'
                  ? 'Hellmodus aktivieren'
                  : 'Dunkelmodus aktivieren'
              }
              aria-label={resolved === 'dark' ? 'Hellmodus' : 'Dunkelmodus'}
            >
              {resolved === 'dark' ? '☀' : '☾'}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <SearchBar
          value={filters.quick}
          onChange={handleQuickChange}
          filters={filters}
          onFiltersChange={setFilters}
          resultCount={loading || error ? undefined : filtered.length}
          totalCount={loading || error ? undefined : records.length}
        />

        <section className="results-meta" aria-live="polite">
          {loading ? <span>Daten werden geladen…</span> : null}
          {error ? <span className="error">{error}</span> : null}
        </section>

        {!loading && !error ? (
          <ResultList
            records={filtered}
            selectedKey={selectedKey}
            highlightQuery={highlightQuery}
            onSelect={(key) =>
              setSelectedKey((prev) => (prev === key ? null : key))
            }
            onResetFilters={resetFilters}
          />
        ) : null}
      </main>

      <DetailSheet
        rec={selectedRecord}
        baseByKey={baseByKey}
        overrides={overrides}
        onClose={() => setSelectedKey(null)}
        onFieldChange={handleFieldChange}
        onResetRow={handleResetRow}
      />

      <ToolsPanel
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={resetFilters}
        tabTypen={tabTypen}
        overrideCount={ovCount}
        onExport={handleExport}
        onImportFile={handleImportFile}
        onResetAllOverrides={handleResetAll}
      />

      <footer className="footer">
        <span>
          Clientseitige Filterung · Overrides nur lokal · keine Backend-Anbindung
        </span>
      </footer>
    </div>
  );
}
