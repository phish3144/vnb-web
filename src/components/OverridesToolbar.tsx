import { useRef, useState } from 'react';

interface Props {
  count: number;
  onExport: () => void;
  onImportFile: (file: File | null) => void;
  onResetAll: () => void;
}

export function OverridesToolbar({
  count,
  onExport,
  onImportFile,
  onResetAll,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="overrides-bar compact" aria-label="Lokale Overrides">
      <div className="overrides-info">
        <strong>Overrides</strong>
        <span className="muted">
          {count === 0
            ? 'keine'
            : `${count} Einträg${count === 1 ? '' : 'e'}`}
        </span>
      </div>

      <div className="overrides-actions desktop-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onExport}
          disabled={count === 0}
        >
          Export
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={onResetAll}
          disabled={count === 0}
        >
          Zurücksetzen
        </button>
      </div>

      <div className="overrides-menu-wrap">
        <button
          type="button"
          className="btn btn-secondary btn-sm overrides-menu-btn"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          Mehr ▾
        </button>
        {menuOpen && (
          <>
            <button
              type="button"
              className="menu-backdrop"
              aria-label="Menü schließen"
              onClick={() => setMenuOpen(false)}
            />
            <ul className="overrides-menu" role="menu">
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={count === 0}
                  onClick={() => {
                    setMenuOpen(false);
                    onExport();
                  }}
                >
                  Export JSON
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                >
                  Import JSON
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="danger"
                  disabled={count === 0}
                  onClick={() => {
                    setMenuOpen(false);
                    onResetAll();
                  }}
                >
                  Alle zurücksetzen
                </button>
              </li>
            </ul>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        onChange={(e) => onImportFile(e.target.files?.[0] ?? null)}
      />
    </section>
  );
}
