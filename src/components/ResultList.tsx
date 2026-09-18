import type { VnbRecord } from '../types';
import {
  displayValue,
  extractUrls,
  isBdewOrMusterOnly,
  isPresent,
  primaryTabLink,
  toHref,
} from '../utils';
import { hasVnbTabErgaenzung } from '../filter';
import { highlightText } from '../highlight';
import {
  type OverridesMap,
  recordKey,
} from '../overrides';

interface Props {
  records: VnbRecord[];
  overrides: OverridesMap;
  selectedKey: string | null;
  highlightQuery: string;
  onSelect: (key: string) => void;
  onResetFilters: () => void;
}

export function ResultList({
  records,
  overrides,
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
    <>
      <div className="table-wrap result-desktop">
        <table className="result-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th className="hide-sm">Website</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, i) => {
              const key = recordKey(rec);
              const selected = selectedKey === key;
              const hasOv =
                !!overrides[key] && Object.keys(overrides[key]!).length > 0;
              return (
                <ResultRow
                  key={`${key}-${i}`}
                  rec={rec}
                  selected={selected}
                  hasOverride={hasOv}
                  highlightQuery={highlightQuery}
                  onSelect={() => onSelect(key)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="result-cards result-mobile" aria-label="Ergebnisse">
        {records.map((rec, i) => {
          const key = recordKey(rec);
          const selected = selectedKey === key;
          const hasOv =
            !!overrides[key] && Object.keys(overrides[key]!).length > 0;
          return (
            <li key={`${key}-card-${i}`}>
              <ResultCard
                rec={rec}
                selected={selected}
                hasOverride={hasOv}
                highlightQuery={highlightQuery}
                onSelect={() => onSelect(key)}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}

function ResultRow({
  rec,
  selected,
  hasOverride,
  highlightQuery,
  onSelect,
}: {
  rec: VnbRecord;
  selected: boolean;
  hasOverride: boolean;
  highlightQuery: string;
  onSelect: () => void;
}) {
  const muted = isBdewOrMusterOnly(rec);

  return (
    <tr
      className={`data-row ${selected ? 'row-open' : ''} ${muted ? 'row-muted' : ''}`}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <td className="col-name">
        <div className="name-block">
          <strong className="name-strong">
            {highlightText(displayValue(rec.Name), highlightQuery)}
          </strong>
          <div className="meta-line">
            <span>{displayValue(rec.Ort)}</span>
            <span className="meta-sep">·</span>
            <span className="bl-badge">{displayValue(rec.Bundesland)}</span>
            <BadgeStack rec={rec} hasOverride={hasOverride} muted={muted} />
          </div>
        </div>
      </td>
      <td>
        <StatusChips rec={rec} />
      </td>
      <td className="hide-sm" onClick={(e) => e.stopPropagation()}>
        <LinkCell value={rec.Website} short />
      </td>
    </tr>
  );
}

function ResultCard({
  rec,
  selected,
  hasOverride,
  highlightQuery,
  onSelect,
}: {
  rec: VnbRecord;
  selected: boolean;
  hasOverride: boolean;
  highlightQuery: string;
  onSelect: () => void;
}) {
  const muted = isBdewOrMusterOnly(rec);

  return (
    <button
      type="button"
      className={`result-card ${selected ? 'is-selected' : ''} ${muted ? 'is-muted' : ''}`}
      onClick={onSelect}
    >
      <div className="name-block">
        <strong className="name-strong">
          {highlightText(displayValue(rec.Name), highlightQuery)}
        </strong>
        <div className="meta-line">
          <span>{displayValue(rec.Ort)}</span>
          <span className="meta-sep">·</span>
          <span className="bl-badge">{displayValue(rec.Bundesland)}</span>
        </div>
        <div className="card-badges">
          <BadgeStack rec={rec} hasOverride={hasOverride} muted={muted} />
          <StatusChips rec={rec} />
        </div>
      </div>
    </button>
  );
}

function BadgeStack({
  rec,
  hasOverride,
  muted,
}: {
  rec: VnbRecord;
  hasOverride: boolean;
  muted: boolean;
}) {
  return (
    <span className="badge-stack">
      {muted && (
        <span className="badge-muster" title="BDEW-/Muster-Eintrag">
          Muster/BDEW
        </span>
      )}
      {hasOverride && (
        <span className="badge-override" title="Lokale Überschreibungen">
          lokal
        </span>
      )}
      {isPresent(rec.Besonderheiten) && (
        <span className="badge-besonderheit" title={rec.Besonderheiten}>
          Besonderheit
        </span>
      )}
    </span>
  );
}

function StatusChips({ rec }: { rec: VnbRecord }) {
  const tabLink = primaryTabLink(rec);
  const hasTab = isPresent(tabLink);
  const hasErg = hasVnbTabErgaenzung(rec);
  const hasPortal = isPresent(rec.Anmeldeportal);

  return (
    <span className="status-chips">
      <span
        className={`status-chip ${hasTab ? 'chip-ok' : 'chip-miss'}`}
        title={hasTab ? 'TAB vorhanden' : 'TAB fehlt'}
      >
        TAB
      </span>
      <span
        className={`status-chip ${hasErg ? 'chip-ok chip-erg' : 'chip-miss'}`}
        title={hasErg ? 'VNB-TAB-Ergänzung' : 'Keine Ergänzung'}
      >
        Ergänzung
      </span>
      <span
        className={`status-chip ${hasPortal ? 'chip-ok' : 'chip-miss'}`}
        title={hasPortal ? 'Portal vorhanden' : 'Portal fehlt'}
      >
        Portal
      </span>
    </span>
  );
}

function LinkCell({ value, short }: { value: string; short?: boolean }) {
  const urls = extractUrls(value);
  if (urls.length === 0) {
    return <span className="muted">—</span>;
  }
  return (
    <>
      {urls.slice(0, short ? 1 : undefined).map((u) => (
        <a
          key={u}
          href={toHref(u)}
          target="_blank"
          rel="noopener noreferrer"
          className="ext-link"
          title={u}
        >
          {short ? hostLabel(u) : u}
        </a>
      ))}
    </>
  );
}

function hostLabel(url: string): string {
  try {
    const u = new URL(toHref(url));
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url.slice(0, 28) + (url.length > 28 ? '…' : '');
  }
}
