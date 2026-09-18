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

interface Props {
  records: VnbRecord[];
}

export function ResultTable({ records }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

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
            const open = expanded === i;
            return (
              <RowGroup
                key={`${rec.Name}-${rec.PLZ}-${i}`}
                rec={rec}
                open={open}
                onToggle={() => setExpanded(open ? null : i)}
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
  open,
  onToggle,
}: {
  rec: VnbRecord;
  open: boolean;
  onToggle: () => void;
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
            <DetailPanel rec={rec} />
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

function DetailPanel({ rec }: { rec: VnbRecord }) {
  const hasErgaenzung = isPresent(rec.TAB_Ergaenzung_Link);
  return (
    <div className="detail-panel">
      <dl className="detail-grid">
        <DetailItem label="Name" value={rec.Name} />
        <DetailItem label="Rechtsform" value={rec.Rechtsform} />
        <DetailItem label="Straße" value={rec.Strasse} />
        <DetailItem label="PLZ" value={rec.PLZ} />
        <DetailItem label="Ort" value={rec.Ort} />
        <DetailItem label="Bundesland" value={rec.Bundesland} />
        <DetailItem label="Telefon" value={rec.Telefon} />
        <DetailItem label="E-Mail" value={rec.Email} email />
        <DetailItem label="Website" value={rec.Website} links />
        {hasErgaenzung && (
          <DetailItem
            label="TAB-Ergänzung (primär)"
            value={rec.TAB_Ergaenzung_Link}
            links
          />
        )}
        <DetailItem
          label={hasErgaenzung ? 'TAB Niederspannung (Fallback)' : 'TAB Niederspannung'}
          value={rec.TAB_Niederspannung_Link}
          links
        />
        <DetailItem label="TAB-Stand" value={rec.TAB_Stand} />
        <DetailItem label="Anmeldeportal" value={rec.Anmeldeportal} links />
        {isPresent(rec.MastrNummer) && (
          <DetailItem label="MaStR-Nummer" value={rec.MastrNummer} />
        )}
        {isPresent(rec.TAB_Typ) && (
          <DetailItem label="TAB-Typ" value={rec.TAB_Typ} />
        )}
        {isPresent(rec.Planauskunft_Link) && (
          <DetailItem label="Planauskunft" value={rec.Planauskunft_Link} links />
        )}
        {isPresent(rec.Link_geprueft) && (
          <DetailItem label="Link geprüft" value={rec.Link_geprueft} />
        )}
        {isPresent(rec.Link_Status) && (
          <DetailItem label="Link-Status" value={rec.Link_Status} />
        )}
        <DetailItem label="Quelle" value={rec.Quelle} links />
        <DetailItem label="Recherche-Datum" value={rec.Recherche_Datum} />
        <DetailItem label="Anmerkung" value={rec.Anmerkung} wide />
      </dl>
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
