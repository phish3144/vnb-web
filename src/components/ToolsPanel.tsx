import { useEffect, useId, useRef } from 'react';
import type { Filters } from '../types';
import { AdvancedFilters } from './AdvancedFilters';
import { OverridesToolbar } from './OverridesToolbar';

interface Props {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onResetFilters: () => void;
  tabTypen: string[];
  overrideCount: number;
  onExport: () => void;
  onImportFile: (file: File | null) => void;
  onResetAllOverrides: () => void;
}

export function ToolsPanel({
  open,
  onClose,
  filters,
  onFiltersChange,
  onResetFilters,
  tabTypen,
  overrideCount,
  onExport,
  onImportFile,
  onResetAllOverrides,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      panelRef.current
        ?.querySelector<HTMLElement>('button, input, select')
        ?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="tools-overlay" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        className="tools-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tools-panel-header">
          <h2 id={titleId} className="tools-panel-title">
            Werkzeuge
          </h2>
          <button
            type="button"
            className="btn btn-ghost"
            aria-label="Schließen"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="tools-panel-body">
          <section className="tools-section" aria-label="Mehr Filter">
            <h3 className="tools-section-title">Mehr Filter</h3>
            <AdvancedFilters
              filters={filters}
              onChange={onFiltersChange}
              onReset={onResetFilters}
              tabTypen={tabTypen}
              alwaysOpen
            />
          </section>

          <section className="tools-section" aria-label="Lokale Overrides">
            <h3 className="tools-section-title">Lokale Overrides</h3>
            <OverridesToolbar
              count={overrideCount}
              onExport={onExport}
              onImportFile={onImportFile}
              onResetAll={onResetAllOverrides}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
