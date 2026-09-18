import { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

interface Props {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  totalCount?: number;
}

export function SearchBar({ value, onChange, resultCount, totalCount }: Props) {
  const [local, setLocal] = useState(value);
  const debounced = useDebouncedValue(local, 175);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  // Sync from parent (e.g. reset)
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // Push debounced local to parent only (never undo an external reset)
  useEffect(() => {
    if (debounced !== valueRef.current) {
      onChangeRef.current(debounced);
    }
  }, [debounced]);

  return (
    <div className="search-hero">
      <label className="search-hero-label" htmlFor="vnb-quick-search">
        Schnellsuche
      </label>
      <div className="search-hero-row">
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
          {local && (
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
          )}
        </div>
      </div>
      {typeof resultCount === 'number' && typeof totalCount === 'number' && (
        <p className="search-hero-meta" aria-live="polite">
          <strong>{resultCount}</strong> von <strong>{totalCount}</strong>{' '}
          Einträgen
        </p>
      )}
    </div>
  );
}
