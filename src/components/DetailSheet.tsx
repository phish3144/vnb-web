import { useEffect, useId, useState, type ReactNode } from 'react';
import type { VnbRecord } from '../types';
import { extractUrls, isPresent, toHref } from '../utils';
import {
  type OverrideField,
  type OverridesMap,
  recordKey,
} from '../overrides';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface Props {
  rec: VnbRecord | null;
  baseByKey: Map<string, VnbRecord>;
  overrides: OverridesMap;
  onClose: () => void;
  onFieldChange: (key: string, field: OverrideField, value: string) => void;
  onResetRow: (key: string) => void;
}

export function DetailSheet({
  rec,
  baseByKey,
  overrides,
  onClose,
  onFieldChange,
  onResetRow,
}: Props) {
  const titleId = useId();
  const isMobile = useMediaQuery('(max-width: 720px)');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [rec ? recordKey(rec) : null]);

  useEffect(() => {
    if (!rec) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rec, onClose]);

  useEffect(() => {
    if (!rec || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [rec, isMobile]);

  if (!rec) return null;

  const rowKey = recordKey(rec);
  const base = baseByKey.get(rowKey) ?? rec;
  const hasOverride =
    !!overrides[rowKey] && Object.keys(overrides[rowKey]!).length > 0;
  const hasErgaenzung = isPresent(rec.TAB_Ergaenzung_Link);

  const field = (
    fieldName: OverrideField,
    label: string,
    opts?: { multiline?: boolean; links?: boolean; email?: boolean; wide?: boolean },
  ) => {
    if (editing) {
      return (
        <EditableItem
          key={fieldName}
          label={label}
          field={fieldName}
          value={rec[fieldName]}
          baseValue={base[fieldName]}
          multiline={opts?.multiline}
          onChange={(v) => onFieldChange(rowKey, fieldName, v)}
        />
      );
    }
    return (
      <DetailItem
        key={fieldName}
        label={label}
        value={rec[fieldName]}
        links={opts?.links}
        email={opts?.email}
        wide={opts?.wide || opts?.multiline}
      />
    );
  };

  return (
    <div
      className={`detail-overlay ${isMobile ? 'is-mobile' : 'is-desktop'}`}
      role="presentation"
      onClick={onClose}
    >
      <aside
        className="detail-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="detail-sheet-header">
          <div className="detail-sheet-titles">
            <h2 id={titleId} className="detail-sheet-title">
              {rec.Name || 'Details'}
            </h2>
            <p className="detail-sheet-sub muted">
              {[rec.Ort, rec.Bundesland].filter(isPresent).join(' · ') || '—'}
            </p>
            {hasOverride ? (
              <span
                className="badge-override detail-override-badge"
                title="Dieser Eintrag hat lokale Überschreibungen"
              >
                lokal überschrieben
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className="btn btn-ghost detail-close"
            aria-label="Schließen"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="detail-sheet-body">
          <section className="detail-section">
            <h3 className="detail-section-title">Stammdaten</h3>
            <dl className="detail-grid">
              <DetailItem label="Name" value={rec.Name} />
              <DetailItem label="Rechtsform" value={rec.Rechtsform} />
              <DetailItem label="Straße" value={rec.Strasse} />
              <DetailItem label="PLZ" value={rec.PLZ} />
              <DetailItem label="Ort" value={rec.Ort} />
              <DetailItem label="Bundesland" value={rec.Bundesland} />
              {field('Telefon', 'Telefon')}
              {field('Email', 'E-Mail', { email: true })}
              {field('Website', 'Website', { links: true })}
              {isPresent(rec.MastrNummer) ? (
                <DetailItem label="MaStR-Nummer" value={rec.MastrNummer} />
              ) : null}
            </dl>
          </section>

          <section className="detail-section">
            <h3 className="detail-section-title">TAB / Links</h3>
            <dl className="detail-grid">
              {field(
                'TAB_Ergaenzung_Link',
                hasErgaenzung ? 'TAB-Ergänzung (primär)' : 'TAB-Ergänzung',
                { links: true },
              )}
              {field(
                'TAB_Niederspannung_Link',
                hasErgaenzung
                  ? 'TAB Niederspannung (Fallback)'
                  : 'TAB Niederspannung',
                { links: true },
              )}
              <DetailItem label="TAB-Stand" value={rec.TAB_Stand} />
              {isPresent(rec.TAB_Typ) ? (
                <DetailItem label="TAB-Typ" value={rec.TAB_Typ} />
              ) : null}
              {field('Anmeldeportal', 'Anmeldeportal', { links: true })}
              {field('Planauskunft_Link', 'Planauskunft', { links: true })}
              {isPresent(rec.Link_geprueft) ? (
                <DetailItem label="Link geprüft" value={rec.Link_geprueft} />
              ) : null}
              {isPresent(rec.Link_Status) ? (
                <DetailItem label="Link-Status" value={rec.Link_Status} />
              ) : null}
            </dl>
          </section>

          <section className="detail-section">
            <h3 className="detail-section-title">Quellen</h3>
            <dl className="detail-grid">
              <DetailItem label="Quelle" value={rec.Quelle} links />
              {isPresent(rec.Quelle_Stammdaten) ? (
                <DetailItem
                  label="Quelle Stammdaten"
                  value={rec.Quelle_Stammdaten}
                  links
                />
              ) : null}
              {isPresent(rec.Quelle_TAB) ? (
                <DetailItem label="Quelle TAB" value={rec.Quelle_TAB} links />
              ) : null}
              {isPresent(rec.Quelle_Portal) ? (
                <DetailItem
                  label="Quelle Portal"
                  value={rec.Quelle_Portal}
                  links
                />
              ) : null}
              {isPresent(rec.Quelle_Planauskunft) ? (
                <DetailItem
                  label="Quelle Planauskunft"
                  value={rec.Quelle_Planauskunft}
                  links
                />
              ) : null}
              <DetailItem label="Recherche-Datum" value={rec.Recherche_Datum} />
              <DetailItem label="Anmerkung" value={rec.Anmerkung} wide />
            </dl>
          </section>

          <section className="detail-section">
            <h3 className="detail-section-title">Besonderheiten</h3>
            <dl className="detail-grid">
              {field('Besonderheiten', 'Besonderheiten', {
                multiline: true,
                wide: true,
              })}
            </dl>
          </section>
        </div>

        <footer className="detail-sheet-footer">
          <button
            type="button"
            className={`btn btn-sm ${editing ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setEditing((v) => !v)}
            aria-pressed={editing}
          >
            {editing ? 'Fertig' : 'Bearbeiten'}
          </button>
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
        </footer>
      </aside>
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
    <div
      className={`detail-item editable ${multiline ? 'wide' : ''} ${overridden ? 'is-overridden' : ''}`}
    >
      <dt>
        {label}
        {overridden ? (
          <span className="override-mark" title="Lokal überschrieben">
            {' '}
            ✎
          </span>
        ) : null}
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
            inputMode={
              field === 'Telefon' ? 'tel' : field === 'Email' ? 'email' : 'url'
            }
          />
        )}
        {!multiline && urls.length > 0 ? (
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
        ) : null}
        {isEmail ? (
          <a href={`mailto:${value.trim()}`} className="ext-link edit-links">
            E-Mail öffnen
          </a>
        ) : null}
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
          {urls.length === 1 && value.trim() !== urls[0] ? (
            <span className="muted small block">{value}</span>
          ) : null}
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
