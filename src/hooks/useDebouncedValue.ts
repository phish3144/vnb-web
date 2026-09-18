import { useEffect, useState } from 'react';

/** Debounce a value by `delayMs` (default 175ms). */
export function useDebouncedValue<T>(value: T, delayMs = 175): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
