import { Database, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { DATA_SOURCE } from '../../services/dataService.js';
import { formatDate, formatDateTime } from '../../utils/format.js';
import Button from './Button.jsx';

/** Thin strip shown on every screen: the data is simulated and must never be read as real surveillance. */
export function DataNoticeBar() {
  return (
    <div className="border-b border-accent/30 bg-accent/10 px-4 py-1.5 text-center text-xs text-accent-fg">
      Simulated demonstration data. These figures are invented and are not live or verified. Not for medical, policy or operational decisions.
    </div>
  );
}

/** Data source and status indicator. */
export function StatusIndicator({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-fg ${className}`}
      title={DATA_SOURCE.note}
    >
      <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-accent" aria-hidden="true" />
      {DATA_SOURCE.name}
      <span className="h-3 w-px bg-accent/40" aria-hidden="true" />
      <span className="text-ink-muted">Live feed not configured</span>
    </span>
  );
}

export function DataStatusBar() {
  const { syncedAt, meta, refresh, syncing } = useApp();
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <StatusIndicator />
      <p className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
        <span>
          Loaded <span className="font-medium text-ink">{formatDateTime(syncedAt)}</span>
        </span>
        <span>
          Data reference date <span className="font-medium text-ink">{formatDate(meta?.referenceDate)}</span>
        </span>
      </p>
      <Button size="sm" icon={RefreshCw} onClick={refresh} disabled={syncing} aria-label="Reload the simulated dataset">
        <span className={syncing ? 'animate-pulse' : ''}>{syncing ? 'Refreshing…' : 'Refresh'}</span>
      </Button>
    </div>
  );
}

const PROVENANCE = [
  { tag: 'Simulated', what: 'Outbreak cases, fatalities, recoveries, trends and risk scores', how: 'Generated from a seeded model in this app.' },
  { tag: 'Derived', what: 'Alerts, summaries and country indicators', how: 'Calculated from the simulated figures.' },
  { tag: 'Reference', what: 'Country names, regions, marker positions, approximate populations', how: 'Static labels bundled with the app. Not verified for this use.' },
  { tag: 'Real', what: 'Country boundaries on the map', how: 'Natural Earth geometry via the world-atlas package.' },
];

export function DataProvenance({ compact = false }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <Database className="h-4 w-4 text-accent" aria-hidden="true" />
        Where the data comes from
      </p>
      <ul className="space-y-2.5">
        {PROVENANCE.map((p) => (
          <li key={p.tag} className="flex gap-3 text-xs leading-relaxed">
            <span
              className={`mt-0.5 h-fit shrink-0 rounded border px-1.5 py-0.5 font-medium ${
                p.tag === 'Real' ? 'border-line-strong bg-panel-3 text-ink-muted' : 'border-accent/40 bg-accent/10 text-accent-fg'
              }`}
            >
              {p.tag}
            </span>
            <span className="text-ink-muted">
              <span className="text-ink">{p.what}.</span>
              {!compact && <> {p.how}</>}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-muted">No verified real-world outbreak data is used anywhere in this application.</p>
    </div>
  );
}
