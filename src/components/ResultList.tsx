import type { VnbRecord } from '../types';
import {
  displayValue,
  isBdewOrMusterOnly,
  isPresent,
  primaryTabLink,
} from '../utils';
import { hasVnbTabErgaenzung } from '../filter';
import { highlightText } from '../highlight';
import { recordKey } from '../overrides';

interface Props {
  records: VnbRecord[];
  selectedKey: string | null;
  highlightQuery: string;
  onSelect: (key: string) => void;
  onResetFilters: () => void;
}

export function ResultList({
  records,
  selectedKey,
  highlightQuery,
  onSelect,
  onResetFilters,
}: Props) {
  if (records.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">Keine Treffer</p>
        <p className="empty-hint muted">
          Filter anpassen oder zurücksetzen, um wieder Ergebnisse zu sehen.
        </p>
        <button type="button" className="btn btn-primary" onClick={onResetFilters}>
          Filter zurücksetzen
        </button>
      </div>
    );
  }

  return (
    <ul className="result-cards" aria-label="Ergebnisse">
      {records.map((rec, i) => {
        const key = recordKey(rec);
        return (
          <li key={`${key}-${i}`}>
            <ResultCard
              rec={rec}
              selected={selectedKey === key}
              highlightQuery={highlightQuery}
              onSelect={() => onSelect(key)}
            />
          </li>
        );
      })}
    </ul>
  );
}

function ResultCard({
  rec,
  selected,
  highlightQuery,
  onSelect,
}: {
  rec: VnbRecord;
  selected: boolean;
  highlightQuery: string;
  onSelect: () => void;
}) {
  const muted = isBdewOrMusterOnly(rec);
  const chips = statusChips(rec);

  return (
    <button
      type="button"
      className={`result-card ${selected ? 'is-selected' : ''} ${muted ? 'is-muted' : ''}`}
      onClick={onSelect}
    >
      <strong className="name-strong">
        {highlightText(displayValue(rec.Name), highlightQuery)}
      </strong>
      <div className="meta-line">
        <span>{displayValue(rec.Ort)}</span>
        <span className="meta-sep" aria-hidden>
          ·
        </span>
        <span>{displayValue(rec.Bundesland)}</span>
      </div>
      {chips.length > 0 ? (
        <div className="card-status">
          {chips.map((c) => (
            <span key={c} className="status-chip chip-ok">
              {c}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}

/** Max 2 positive status chips — no miss badges. */
function statusChips(rec: VnbRecord): string[] {
  const out: string[] = [];
  if (hasVnbTabErgaenzung(rec)) {
    out.push('Ergänzung');
  } else if (isPresent(primaryTabLink(rec))) {
    out.push('TAB');
  }
  if (isPresent(rec.Anmeldeportal)) {
    out.push('Portal');
  }
  return out.slice(0, 2);
}
