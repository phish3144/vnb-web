import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterRecords } from './filter';
import { loadVnbData } from './loadData';
import type { Filters, VnbRecord } from './types';
import { EMPTY_FILTERS } from './types';
import { FilterBar } from './components/FilterBar';
import { ResultTable } from './components/ResultTable';

export default function App() {
  const [records, setRecords] = useState<VnbRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadVnbData();
        if (!cancelled) {
          setRecords(data);
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

  const filtered = useMemo(
    () => filterRecords(records, filters),
    [records, filters],
  );

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

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
        />

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
          <ResultTable records={filtered} />
        )}
      </main>

      <footer className="footer">
        <span>Clientseitige Filterung · keine Backend-Anbindung</span>
      </footer>
    </div>
  );
}
