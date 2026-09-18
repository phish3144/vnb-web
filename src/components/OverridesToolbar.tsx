import { useRef } from 'react';

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

  return (
    <div className="overrides-panel" aria-label="Lokale Overrides">
      <p className="overrides-summary">
        {count === 0
          ? 'Keine lokalen Overrides gespeichert.'
          : `${count} Einträg${count === 1 ? '' : 'e'} lokal überschrieben.`}
      </p>
      <p className="hint">
        Overrides liegen nur in diesem Browser (localStorage). Export/Import als
        JSON für Backup oder Transfer.
      </p>
      <div className="overrides-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onExport}
          disabled={count === 0}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Import JSON
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={onResetAll}
          disabled={count === 0}
        >
          Alle zurücksetzen
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        onChange={(e) => {
          onImportFile(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />
    </div>
  );
}
