import { useState, type ReactNode } from 'react';
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
import {
  type OverrideField,
  type OverridesMap,
  recordKey,
} from '../overrides';

interface Props {
  records: VnbRecord[];
  /** Original CSV-Zeilen (ohne Overrides), keyed by recordKey */
  baseByKey: Map<string, VnbRecord>;
  overrides: OverridesMap;
  onFieldChange: (key: string, field: OverrideField, value: string) => void;
  onResetRow: (key: string) => void;
}

export function ResultTable({
  records,
  baseByKey,
  overrides,
  onFieldChange,
  onResetRow,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (records.length === 0) {
    return (
      <div className="empty-state">
        Keine Treffer – Filter anpassen oder zurücksetzen.
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="result-table">
        <thead>
          <tr>
            <th className="col-expand" aria-label="Details" />
            <th>Name</th>
            <th className="hide-sm">Ort</th>
            <th className="hide-md">PLZ</th>
            <th>BL</th>
            <th className="hide-sm">Website</th>
            <th className="hide-md">TAB</th>
            <th className="hide-md">Portal</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec, i) => {
            const key = recordKey(rec);
            const open = expanded === key;
            const hasOv = !!overrides[key] && Object.keys(overrides[key]).length > 0;
            return (
              <RowGroup
                key={`${key}-${i}`}
                rec={rec}
                base={baseByKey.get(key) ?? rec}
                rowKey={key}
                open={open}
                hasOverride={hasOv}
                onToggle={() => setExpanded(open ? null : key)}
                onFieldChange={onFieldChange}
                onResetRow={onResetRow}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RowGroup({
  rec,
  base,
  rowKey,
  open,
  hasOverride,
  onToggle,
  onFieldChange,
  onResetRow,
}: {
  rec: VnbRecord;
  base: VnbRecord;
  rowKey: string;
  open: boolean;
  hasOverride: boolean;
  onToggle: () => void;
  onFieldChange: (key: string, field: OverrideField, value: string) => void;
  onResetRow: (key: string) => void;
}) {
  const muted = isBdewOrMusterOnly(rec);
  const tabLink = primaryTabLink(rec);

  return (
    <>
      <tr
        className={`data-row ${open ? 'row-open' : ''} ${muted ? 'row-muted' : ''}`}
        onClick={onToggle}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <td className="col-expand">
          <span className="chevron" aria-hidden>
            {open ? '▾' : '▸'}
          </span>
        </td>
        <td className="col-name">
          <strong>{displayValue(rec.Name)}</strong>
          {isPresent(rec.Rechtsform) && (
            <span className="muted small"> · {rec.Rechtsform}</span>
          )}
          {muted && (
            <span className="badge-muster" title="BDEW-/Muster-Eintrag">
              Muster/BDEW
            </span>
          )}
          {hasVnbTabErgaenzung(rec) && (
            <span className="badge-ergaenzung" title="VNB-TAB-Ergänzung">
              VNB-TAB
            </span>
          )}
          {hasOverride && (
            <span className="badge-override" title="Lokale Überschreibungen">
              lokal
            </span>
          )}
          {isPresent(rec.Besonderheiten) && (
            <span
              className="badge-besonderheit"
              title={rec.Besonderheiten}
            >
              Besonderheit
            </span>
          )}
        </td>
        <td className="hide-sm">{displayValue(rec.Ort)}</td>
        <td className="hide-md mono">{displayValue(rec.PLZ)}</td>
        <td>
          <span className="bl-badge">{displayValue(rec.Bundesland)}</span>
        </td>
        <td className="hide-sm" onClick={(e) => e.stopPropagation()}>
          <LinkCell value={rec.Website} short />
        </td>
        <td className="hide-md status-cell" onClick={(e) => e.stopPropagation()}>
          {isPresent(tabLink) ? (
            <LinkCell value={tabLink} short />
          ) : (
            <StatusDot present={false} label="TAB" />
          )}
        </td>
        <td className="hide-md status-cell">
          <StatusDot present={isPresent(rec.Anmeldeportal)} label="Portal" />
        </td>
      </tr>
      {open && (
        <tr className={`detail-row ${muted ? 'row-muted' : ''}`}>
          <td colSpan={8}>
            <DetailPanel
              rec={rec}
              base={base}
              rowKey={rowKey}
              hasOverride={hasOverride}
              onFieldChange={onFieldChange}
              onResetRow={onResetRow}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function StatusDot({ present, label }: { present: boolean; label: string }) {
  return (
    <span
      className={`status-dot ${present ? 'ok' : 'miss'}`}
      title={present ? `${label} vorhanden` : `${label} fehlt`}
    >
      {present ? '●' : '○'}
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

function DetailPanel({
  rec,
  base,
  rowKey,
  hasOverride,
  onFieldChange,
  onResetRow,
}: {
  rec: VnbRecord;
  base: VnbRecord;
  rowKey: string;
  hasOverride: boolean;
  onFieldChange: (key: string, field: OverrideField, value: string) => void;
  onResetRow: (key: string) => void;
}) {
  const hasErgaenzung = isPresent(rec.TAB_Ergaenzung_Link);

  const edit = (field: OverrideField, label: string, multiline?: boolean) => (
    <EditableItem
      label={label}
      field={field}
      value={rec[field]}
      baseValue={base[field]}
      multiline={multiline}
      onChange={(v) => onFieldChange(rowKey, field, v)}
    />
  );

  return (
    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
      <div className="detail-toolbar">
        {hasOverride && (
          <span className="badge-override" title="Dieser Eintrag hat lokale Überschreibungen">
            lokal überschrieben
          </span>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!hasOverride}
          onClick={() => {
            if (
              window.confirm(
                'Lokale Überschreibungen für diesen Eintrag zurücksetzen?',
              )
            ) {
              onResetRow(rowKey);
            }
          }}
        >
          Overrides zurücksetzen
        </button>
      </div>

      <dl className="detail-grid">
        <DetailItem label="Name" value={rec.Name} />
        <DetailItem label="Rechtsform" value={rec.Rechtsform} />
        <DetailItem label="Straße" value={rec.Strasse} />
        <DetailItem label="PLZ" value={rec.PLZ} />
        <DetailItem label="Ort" value={rec.Ort} />
        <DetailItem label="Bundesland" value={rec.Bundesland} />

        {edit('Telefon', 'Telefon')}
        {edit('Email', 'E-Mail')}
        {edit('Website', 'Website')}
        {edit(
          'TAB_Ergaenzung_Link',
          hasErgaenzung ? 'TAB-Ergänzung (primär)' : 'TAB-Ergänzung',
        )}
        {edit(
          'TAB_Niederspannung_Link',
          hasErgaenzung ? 'TAB Niederspannung (Fallback)' : 'TAB Niederspannung',
        )}
        <DetailItem label="TAB-Stand" value={rec.TAB_Stand} />
        {edit('Anmeldeportal', 'Anmeldeportal')}
        {edit('Planauskunft_Link', 'Planauskunft')}

        {isPresent(rec.MastrNummer) && (
          <DetailItem label="MaStR-Nummer" value={rec.MastrNummer} />
        )}
        {isPresent(rec.TAB_Typ) && (
          <DetailItem label="TAB-Typ" value={rec.TAB_Typ} />
        )}
        {isPresent(rec.Link_geprueft) && (
          <DetailItem label="Link geprüft" value={rec.Link_geprueft} />
        )}
        {isPresent(rec.Link_Status) && (
          <DetailItem label="Link-Status" value={rec.Link_Status} />
        )}

        <DetailItem label="Quelle" value={rec.Quelle} links />
        {isPresent(rec.Quelle_Stammdaten) && (
          <DetailItem label="Quelle Stammdaten" value={rec.Quelle_Stammdaten} links />
        )}
        {isPresent(rec.Quelle_TAB) && (
          <DetailItem label="Quelle TAB" value={rec.Quelle_TAB} links />
        )}
        {isPresent(rec.Quelle_Portal) && (
          <DetailItem label="Quelle Portal" value={rec.Quelle_Portal} links />
        )}
        {isPresent(rec.Quelle_Planauskunft) && (
          <DetailItem
            label="Quelle Planauskunft"
            value={rec.Quelle_Planauskunft}
            links
          />
        )}
        <DetailItem label="Recherche-Datum" value={rec.Recherche_Datum} />
        <DetailItem label="Anmerkung" value={rec.Anmerkung} wide />
        {edit('Besonderheiten', 'Besonderheiten', true)}
      </dl>
    </div>
  );
}

function EditableItem({
  label,
  field,
  value,
  baseValue,
  multiline,
  onChange,
}: {
  label: string;
  field: OverrideField;
  value: string;
  baseValue: string;
  multiline?: boolean;
  onChange: (v: string) => void;
}) {
  const overridden = value !== baseValue;
  const urls = !multiline ? extractUrls(value) : [];
  const isEmail = field === 'Email' && value.includes('@');

  return (
    <div className={`detail-item editable ${multiline ? 'wide' : ''} ${overridden ? 'is-overridden' : ''}`}>
      <dt>
        {label}
        {overridden && (
          <span className="override-mark" title="Lokal überschrieben">
            {' '}
            ✎
          </span>
        )}
      </dt>
      <dd>
        {multiline ? (
          <textarea
            className="edit-input edit-textarea"
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Freitext…"
            aria-label={label}
          />
        ) : (
          <input
            type="text"
            className="edit-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="n/a oder Wert…"
            aria-label={label}
            inputMode={field === 'Telefon' ? 'tel' : field === 'Email' ? 'email' : 'url'}
          />
        )}
        {!multiline && urls.length > 0 && (
          <span className="link-stack edit-links">
            {urls.map((u) => (
              <a
                key={u}
                href={toHref(u)}
                target="_blank"
                rel="noopener noreferrer"
                className="ext-link"
              >
                {u}
              </a>
            ))}
          </span>
        )}
        {isEmail && (
          <a href={`mailto:${value.trim()}`} className="ext-link edit-links">
            E-Mail öffnen
          </a>
        )}
      </dd>
    </div>
  );
}

function DetailItem({
  label,
  value,
  links,
  email,
  wide,
}: {
  label: string;
  value: string;
  links?: boolean;
  email?: boolean;
  wide?: boolean;
}) {
  let content: ReactNode;
  if (!isPresent(value)) {
    content = <span className="muted">n/a</span>;
  } else if (email && value.includes('@')) {
    content = (
      <a href={`mailto:${value.trim()}`} className="ext-link">
        {value}
      </a>
    );
  } else if (links) {
    const urls = extractUrls(value);
    if (urls.length > 0) {
      content = (
        <span className="link-stack">
          {urls.map((u) => (
            <a
              key={u}
              href={toHref(u)}
              target="_blank"
              rel="noopener noreferrer"
              className="ext-link"
            >
              {u}
            </a>
          ))}
          {urls.length === 1 && value.trim() !== urls[0] && (
            <span className="muted small block">{value}</span>
          )}
        </span>
      );
    } else {
      content = value;
    }
  } else {
    content = value;
  }

  return (
    <div className={`detail-item ${wide ? 'wide' : ''}`}>
      <dt>{label}</dt>
      <dd>{content}</dd>
    </div>
  );
}
