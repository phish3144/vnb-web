import { useEffect, useId, useState, type ReactNode } from 'react';
import type { VnbRecord } from '../types';
import { extractUrls, isMissing, isPresent, toHref } from '../utils';
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

type ActionDef = {
  field: OverrideField;
  label: string;
  shortLabel: string;
  primary?: boolean;
};

const PRIMARY_ACTIONS: ActionDef[] = [
  {
    field: 'TAB_Ergaenzung_Link',
    label: 'TAB-Ergänzung',
    shortLabel: 'Ergänzung',
    primary: true,
  },
  {
    field: 'TAB_Niederspannung_Link',
    label: 'TAB Niederspannung',
    shortLabel: 'TAB NS',
  },
  {
    field: 'Anmeldeportal',
    label: 'Anmeldeportal',
    shortLabel: 'Anmeldung',
  },
  {
    field: 'Planauskunft_Link',
    label: 'Planauskunft',
    shortLabel: 'Plan',
  },
  {
    field: 'Website',
    label: 'Website',
    shortLabel: 'Website',
  },
];

function firstHref(value: string): string | null {
  const urls = extractUrls(value);
  return urls.length > 0 ? toHref(urls[0]) : null;
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

  const actions = PRIMARY_ACTIONS.flatMap((a) => {
    const href = firstHref(rec[a.field]);
    return href ? [{ ...a, href }] : [];
  });

  const hasErgaenzungAction = actions.some(
    (a) => a.field === 'TAB_Ergaenzung_Link',
  );

  const addressLines = [
    isPresent(rec.Strasse) ? rec.Strasse : null,
    [rec.PLZ, rec.Ort].filter(isPresent).join(' ') || null,
    isPresent(rec.Bundesland) ? rec.Bundesland : null,
  ].filter((line): line is string => !!line);

  const tabMeta = [rec.TAB_Typ, rec.TAB_Stand].filter(isPresent).join(' · ');

  const showStammdaten =
    editing ||
    addressLines.length > 0 ||
    isPresent(rec.Rechtsform) ||
    isPresent(rec.Telefon) ||
    isPresent(rec.Email) ||
    isPresent(rec.MastrNummer);

  const showBesonderheiten = editing || isPresent(rec.Besonderheiten);

  const quelleFields: Array<{
    label: string;
    value: string;
    links?: boolean;
    wide?: boolean;
  }> = [
    { label: 'Quelle', value: rec.Quelle, links: true },
    { label: 'Quelle Stammdaten', value: rec.Quelle_Stammdaten, links: true },
    { label: 'Quelle TAB', value: rec.Quelle_TAB, links: true },
    { label: 'Quelle Portal', value: rec.Quelle_Portal, links: true },
    {
      label: 'Quelle Planauskunft',
      value: rec.Quelle_Planauskunft,
      links: true,
    },
    { label: 'Link geprüft', value: rec.Link_geprueft },
    { label: 'Link-Status', value: rec.Link_Status },
    { label: 'Recherche-Datum', value: rec.Recherche_Datum },
    { label: 'Anmerkung', value: rec.Anmerkung, wide: true },
  ];
  const visibleQuellen = quelleFields.filter((f) => isPresent(f.value));
  const showQuellen = visibleQuellen.length > 0;

  const editableField = (
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
    if (isMissing(rec[fieldName])) return null;
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
          {actions.length > 0 ? (
            <section
              className="detail-section detail-actions-section"
              aria-label="Primäre Links"
            >
              <div className="detail-actions">
                {actions.map((a) => (
                  <a
                    key={a.field}
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn detail-action-btn ${
                      a.primary && hasErgaenzungAction
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                    title={a.label}
                  >
                    {a.shortLabel}
                  </a>
                ))}
              </div>
              {!editing && tabMeta ? (
                <p className="detail-tab-meta muted">{tabMeta}</p>
              ) : null}
            </section>
          ) : null}

          {!editing && !actions.length && tabMeta ? (
            <section className="detail-section">
              <h3 className="detail-section-title">TAB</h3>
              <p className="detail-tab-meta muted detail-tab-meta-solo">
                {tabMeta}
              </p>
            </section>
          ) : null}

          {showStammdaten ? (
            <section className="detail-section">
              <h3 className="detail-section-title">Stammdaten</h3>
              {editing ? (
                <dl className="detail-grid detail-grid-compact">
                  {isPresent(rec.Rechtsform) ? (
                    <DetailItem label="Rechtsform" value={rec.Rechtsform} />
                  ) : null}
                  {isPresent(rec.Strasse) ? (
                    <DetailItem label="Straße" value={rec.Strasse} />
                  ) : null}
                  {isPresent(rec.PLZ) ? (
                    <DetailItem label="PLZ" value={rec.PLZ} />
                  ) : null}
                  {isPresent(rec.Ort) ? (
                    <DetailItem label="Ort" value={rec.Ort} />
                  ) : null}
                  {isPresent(rec.Bundesland) ? (
                    <DetailItem label="Bundesland" value={rec.Bundesland} />
                  ) : null}
                  {editableField('Telefon', 'Telefon')}
                  {editableField('Email', 'E-Mail', { email: true })}
                  {editableField('Website', 'Website', { links: true })}
                  {isPresent(rec.MastrNummer) ? (
                    <DetailItem label="MaStR-Nummer" value={rec.MastrNummer} />
                  ) : null}
                </dl>
              ) : (
                <div className="detail-stammdaten">
                  {isPresent(rec.Rechtsform) ? (
                    <p className="detail-rechtsform muted">{rec.Rechtsform}</p>
                  ) : null}
                  {addressLines.length > 0 ? (
                    <address className="detail-address">
                      {addressLines.map((line) => (
                        <span key={line} className="detail-address-line">
                          {line}
                        </span>
                      ))}
                    </address>
                  ) : null}
                  {isPresent(rec.Telefon) || isPresent(rec.Email) ? (
                    <div className="detail-kontakt">
                      {isPresent(rec.Telefon) ? (
                        <a
                          href={`tel:${rec.Telefon.replace(/\s+/g, '')}`}
                          className="ext-link"
                        >
                          {rec.Telefon}
                        </a>
                      ) : null}
                      {isPresent(rec.Email) ? (
                        <a
                          href={`mailto:${rec.Email.trim()}`}
                          className="ext-link"
                        >
                          {rec.Email}
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  {isPresent(rec.MastrNummer) ? (
                    <p className="detail-mastr muted small">
                      MaStR {rec.MastrNummer}
                    </p>
                  ) : null}
                </div>
              )}
            </section>
          ) : null}

          {editing ? (
            <section className="detail-section">
              <h3 className="detail-section-title">TAB / Links</h3>
              <dl className="detail-grid detail-grid-compact">
                {editableField('TAB_Ergaenzung_Link', 'TAB-Ergänzung', {
                  links: true,
                })}
                {editableField('TAB_Niederspannung_Link', 'TAB Niederspannung', {
                  links: true,
                })}
                {editableField('Anmeldeportal', 'Anmeldeportal', {
                  links: true,
                })}
                {editableField('Planauskunft_Link', 'Planauskunft', {
                  links: true,
                })}
                {isPresent(rec.TAB_Typ) ? (
                  <DetailItem label="TAB-Typ" value={rec.TAB_Typ} />
                ) : null}
                {isPresent(rec.TAB_Stand) ? (
                  <DetailItem label="TAB-Stand" value={rec.TAB_Stand} />
                ) : null}
              </dl>
            </section>
          ) : null}

          {showBesonderheiten ? (
            <section className="detail-section detail-besonderheiten">
              <h3 className="detail-section-title">Besonderheiten</h3>
              {editing ? (
                <dl className="detail-grid detail-grid-compact">
                  {editableField('Besonderheiten', 'Besonderheiten', {
                    multiline: true,
                    wide: true,
                  })}
                </dl>
              ) : (
                <p className="detail-besonderheiten-text">{rec.Besonderheiten}</p>
              )}
            </section>
          ) : null}

          {showQuellen ? (
            <details className="detail-section detail-quellen">
              <summary className="detail-quellen-summary">
                Quellen &amp; Meta
              </summary>
              <dl className="detail-grid detail-grid-compact">
                {visibleQuellen.map((f) => (
                  <DetailItem
                    key={f.label}
                    label={f.label}
                    value={f.value}
                    links={f.links}
                    wide={f.wide}
                  />
                ))}
              </dl>
            </details>
          ) : null}
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
