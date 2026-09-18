import { useEffect, useRef, useState } from 'react';
import type { Filters } from '../types';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

interface Props {
  value: string;
  onChange: (value: string) => void;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  resultCount?: number;
  totalCount?: number;
}

export function SearchBar({
  value,
  onChange,
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: Props) {
  const [local, setLocal] = useState(value);
  const debounced = useDebouncedValue(local, 175);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (debounced !== valueRef.current) {
      onChangeRef.current(debounced);
    }
  }, [debounced]);

  const ergActive = filters.hatVnbTabErgaenzung === 'has';
  const portalActive = filters.anmeldeportal === 'has';

  const toggleErg = () => {
    onFiltersChange({
      ...filters,
      hatVnbTabErgaenzung: ergActive ? 'any' : 'has',
    });
  };

  const togglePortal = () => {
    onFiltersChange({
      ...filters,
      anmeldeportal: portalActive ? 'any' : 'has',
      ...(portalActive ? { anmeldeportalText: '' } : {}),
    });
  };

  return (
    <div className="find-zone">
      <div className="search-sticky">
        <label className="visually-hidden" htmlFor="vnb-quick-search">
          Suche
        </label>
        <div className="search-input-wrap">
          <span className="search-icon" aria-hidden>
            ⌕
          </span>
          <input
            id="vnb-quick-search"
            type="search"
            className="search-hero-input"
            placeholder="Name, Ort, PLZ, Website …"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          {local ? (
            <button
              type="button"
              className="search-clear"
              aria-label="Suche leeren"
              onClick={() => {
                setLocal('');
                onChange('');
              }}
            >
              ×
            </button>
          ) : null}
        </div>

        <div className="quick-chips" role="group" aria-label="Schnellfilter">
          <button
            type="button"
            className={`quick-chip ${ergActive ? 'is-active' : ''}`}
            aria-pressed={ergActive}
            onClick={toggleErg}
          >
            hat VNB-TAB-Ergänzung
          </button>
          <button
            type="button"
            className={`quick-chip ${portalActive ? 'is-active' : ''}`}
            aria-pressed={portalActive}
            onClick={togglePortal}
          >
            hat Anmeldeportal
          </button>
        </div>

        {typeof resultCount === 'number' && typeof totalCount === 'number' ? (
          <p className="search-hero-meta" aria-live="polite">
            <strong>{resultCount}</strong>
            {resultCount === totalCount
              ? ` Einträg${resultCount === 1 ? '' : 'e'}`
              : ` von ${totalCount} Einträgen`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
