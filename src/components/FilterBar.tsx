import type { Filters, PresenceFilter } from '../types';
import { BUNDESLAENDER } from '../types';

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

export function FilterBar({ filters, onChange, onReset, tabTypen }: Props) {
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

  return (
    <section className="filters" aria-label="Filter">
      <div className="filter-row quick-row">
        <label className="field grow">
          <span>Schnellsuche</span>
          <input
            type="search"
            placeholder="Name, Ort, PLZ, Website, …"
            value={filters.quick}
            onChange={(e) => set('quick', e.target.value)}
            autoComplete="off"
          />
        </label>
        <button type="button" className="btn btn-secondary" onClick={onReset}>
          Zurücksetzen
        </button>
      </div>

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
        <div className="chip-grid">
          {BUNDESLAENDER.map(({ code, name }) => {
            const active = filters.bundeslaender.includes(code);
            return (
              <button
                key={code}
                type="button"
                className={`chip ${active ? 'chip-active' : ''}`}
                aria-pressed={active}
                title={name}
                onClick={() => toggleBl(code)}
              >
                {code}
              </button>
            );
          })}
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
