import { useMemo, useState } from 'react';
import type { Filters, PresenceFilter } from '../types';
import { BUNDESLAENDER, EMPTY_FILTERS } from '../types';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  tabTypen: string[];
}

const PRESENCE_OPTIONS: { value: PresenceFilter; label: string }[] = [
  { value: 'any', label: 'egal' },
  { value: 'has', label: 'vorhanden' },
  { value: 'missing', label: 'fehlt' },
];

function countActiveAdvanced(f: Filters): number {
  let n = 0;
  if (f.name.trim()) n++;
  if (f.ort.trim()) n++;
  if (f.plz.trim()) n++;
  if (f.bundeslaender.length) n++;
  if (f.website !== 'any' || f.websiteText.trim()) n++;
  if (f.tab !== 'any' || f.tabText.trim()) n++;
  if (f.anmeldeportal !== 'any' || f.anmeldeportalText.trim()) n++;
  if (f.hatVnbTabErgaenzung !== 'any') n++;
  if (f.hatBesonderheiten !== 'any') n++;
  if (f.tabTyp.trim()) n++;
  return n;
}

export function AdvancedFilters({ filters, onChange, onReset, tabTypen }: Props) {
  const [open, setOpen] = useState(false);
  const active = useMemo(() => countActiveAdvanced(filters), [filters]);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleBl = (code: string) => {
    const cur = filters.bundeslaender;
    const next = cur.includes(code)
      ? cur.filter((c) => c !== code)
      : [...cur, code];
    set('bundeslaender', next);
  };

  const resetAdvanced = () => {
    onChange({
      ...filters,
      name: EMPTY_FILTERS.name,
      ort: EMPTY_FILTERS.ort,
      plz: EMPTY_FILTERS.plz,
      bundeslaender: EMPTY_FILTERS.bundeslaender,
      website: EMPTY_FILTERS.website,
      websiteText: EMPTY_FILTERS.websiteText,
      tab: EMPTY_FILTERS.tab,
      tabText: EMPTY_FILTERS.tabText,
      anmeldeportal: EMPTY_FILTERS.anmeldeportal,
      anmeldeportalText: EMPTY_FILTERS.anmeldeportalText,
      hatVnbTabErgaenzung: EMPTY_FILTERS.hatVnbTabErgaenzung,
      tabTyp: EMPTY_FILTERS.tabTyp,
      hatBesonderheiten: EMPTY_FILTERS.hatBesonderheiten,
    });
  };

  return (
    <section className="advanced-filters" aria-label="Erweiterte Filter">
      <button
        type="button"
        className={`advanced-toggle ${open ? 'is-open' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="advanced-toggle-label">
          Erweiterte Filter
          {active > 0 && (
            <span className="advanced-count" aria-label={`${active} aktiv`}>
              {active}
            </span>
          )}
        </span>
        <span className="advanced-chevron" aria-hidden>
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div className="advanced-body">
          <div className="filter-row">
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Teilstring"
              />
            </label>
            <label className="field">
              <span>Ort</span>
              <input
                type="text"
                value={filters.ort}
                onChange={(e) => set('ort', e.target.value)}
                placeholder="Teilstring"
              />
            </label>
            <label className="field field-sm">
              <span>PLZ</span>
              <input
                type="text"
                value={filters.plz}
                onChange={(e) => set('plz', e.target.value)}
                placeholder="z. B. 10"
                inputMode="numeric"
              />
            </label>
          </div>

          <fieldset className="bundesland-fieldset">
            <legend>Bundesland</legend>
            <div className="chip-scroll">
              <div className="chip-grid">
                {BUNDESLAENDER.map(({ code, name }) => {
                  const isActive = filters.bundeslaender.includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`chip ${isActive ? 'chip-active' : ''}`}
                      aria-pressed={isActive}
                      title={name}
                      onClick={() => toggleBl(code)}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="hint">
              Mehrfachauswahl: Treffer, wenn mindestens ein gewähltes Kürzel im
              Feld vorkommt (z. B. „BB, MV“).
            </p>
          </fieldset>

          <div className="filter-row presence-row">
            <PresenceGroup
              label="Website"
              mode={filters.website}
              text={filters.websiteText}
              onMode={(m) => set('website', m)}
              onText={(t) => set('websiteText', t)}
            />
            <PresenceGroup
              label="TAB-Link"
              mode={filters.tab}
              text={filters.tabText}
              onMode={(m) => set('tab', m)}
              onText={(t) => set('tabText', t)}
            />
            <PresenceGroup
              label="Anmeldeportal vorhanden"
              mode={filters.anmeldeportal}
              text={filters.anmeldeportalText}
              onMode={(m) => set('anmeldeportal', m)}
              onText={(t) => set('anmeldeportalText', t)}
            />
          </div>

          <div className="filter-row presence-row">
            <PresenceGroup
              label="hat VNB-TAB-Ergänzung"
              mode={filters.hatVnbTabErgaenzung}
              text=""
              onMode={(m) => set('hatVnbTabErgaenzung', m)}
              onText={() => {}}
              hideText
            />
            <PresenceGroup
              label="hat Besonderheiten"
              mode={filters.hatBesonderheiten}
              text=""
              onMode={(m) => set('hatBesonderheiten', m)}
              onText={() => {}}
              hideText
            />
            <label className="field field-tab-typ">
              <span>TAB-Typ</span>
              {tabTypen.length > 0 ? (
                <select
                  value={filters.tabTyp}
                  onChange={(e) => set('tabTyp', e.target.value)}
                >
                  <option value="">alle</option>
                  {tabTypen.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={filters.tabTyp}
                  onChange={(e) => set('tabTyp', e.target.value)}
                  placeholder="z. B. VNB_Ergaenzung"
                />
              )}
            </label>
          </div>

          <div className="advanced-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={resetAdvanced}
              disabled={active === 0}
            >
              Erweiterte Filter zurücksetzen
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onReset}
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function PresenceGroup({
  label,
  mode,
  text,
  onMode,
  onText,
  hideText,
}: {
  label: string;
  mode: PresenceFilter;
  text: string;
  onMode: (m: PresenceFilter) => void;
  onText: (t: string) => void;
  hideText?: boolean;
}) {
  return (
    <div className="presence-group">
      <span className="presence-label">{label}</span>
      <div className="segmented" role="group" aria-label={label}>
        {PRESENCE_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={mode === o.value ? 'seg-active' : ''}
            aria-pressed={mode === o.value}
            onClick={() => onMode(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {!hideText && (
        <input
          type="text"
          className="presence-text"
          placeholder="Freitext…"
          value={text}
          disabled={mode === 'missing'}
          onChange={(e) => onText(e.target.value)}
        />
      )}
    </div>
  );
}
