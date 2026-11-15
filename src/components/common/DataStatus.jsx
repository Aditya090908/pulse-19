
import { Database, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { DATA_SOURCE } from '../../services/dataService.js';
import { formatDate, formatDateTime } from '../../utils/format.js';
import Button from './Button.jsx';

/**
 * Persistent notice explaining the different data sources
 * used throughout PULSE-19.
 */
export function DataNoticeBar() {
  return (
    <div className="border-b border-accent/30 bg-accent/10 px-4 py-1.5 text-center text-xs text-accent-fg">
      Demo dashboard metrics are simulated. WHO outbreak reports
      and CDC surveillance are sourced from external APIs.
      CDC figures are provisional. Not for medical, policy or
      operational decisions.
    </div>
  );
}

/**
 * Data source and status indicator for the simulated overview dataset.
 */
export function StatusIndicator({ className = '' }) {
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-fg ${className}`}
      title={DATA_SOURCE.note}
    >
      <span
        className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-accent"
        aria-hidden="true"
      />

      Simulated dashboard metrics

      <span
        className="h-3 w-px bg-accent/40"
        aria-hidden="true"
      />

      <span className="text-ink-muted">
        WHO reports connected
      </span>

      <span
        className="h-3 w-px bg-accent/40"
        aria-hidden="true"
      />

      <span className="text-ink-muted">
        CDC surveillance connected
      </span>
    </span>
  );
}

/**
 * Overview dataset refresh and timestamp information.
 */
export function DataStatusBar() {
  const { syncedAt, meta, refresh, syncing } = useApp();

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <StatusIndicator />

      <p className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
        <span>
          Loaded{' '}
          <span className="font-medium text-ink">
            {formatDateTime(syncedAt)}
          </span>
        </span>

        <span>
          Data reference date{' '}
          <span className="font-medium text-ink">
            {formatDate(meta?.referenceDate)}
          </span>
        </span>
      </p>

      <Button
        size="sm"
        icon={RefreshCw}
        onClick={refresh}
        disabled={syncing}
        aria-label="Reload the simulated dataset"
      >
        <span className={syncing ? 'animate-pulse' : ''}>
          {syncing ? 'Refreshing…' : 'Refresh'}
        </span>
      </Button>
    </div>
  );
}

/**
 * Transparent breakdown of data provenance.
 */
const PROVENANCE = [
  {
    tag: 'Simulated',
    what: 'Overview outbreak cases, fatalities, recoveries, trends and risk scores',
    how: 'Generated from a seeded demonstration model in this application.',
  },
  {
    tag: 'Derived',
    what: 'Dashboard alerts, summaries and country indicators',
    how: 'Calculated from the simulated demonstration figures.',
  },
  {
    tag: 'Reference',
    what: 'Country names, regions, marker positions and approximate populations',
    how: 'Static reference information bundled with the application.',
  },
  {
    tag: 'WHO',
    what: 'Official Disease Outbreak News reports',
    how: 'Retrieved from the WHO Disease Outbreak News API. These are reports, not a complete global numerical surveillance dataset.',
  },
  {
    tag: 'CDC',
    what: 'Numerical NNDSS disease surveillance records',
    how: 'Retrieved from the CDC Socrata API. Data covers US reporting jurisdictions and is provisional.',
  },
  {
    tag: 'Real',
    what: 'Country boundaries on the map',
    how: 'Natural Earth geographic geometry via the world-atlas package.',
  },
];

export function DataProvenance({ compact = false }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <Database
          className="h-4 w-4 text-accent"
          aria-hidden="true"
        />
        Where the data comes from
      </p>

      <ul className="space-y-2.5">
        {PROVENANCE.map((item) => {
          const isExternalSource =
            item.tag === 'WHO' || item.tag === 'CDC';

          const isReal = item.tag === 'Real';

          return (
            <li
              key={item.tag}
              className="flex gap-3 text-xs leading-relaxed"
            >
              <span
                className={`mt-0.5 h-fit shrink-0 rounded border px-1.5 py-0.5 font-medium ${
                  isExternalSource || isReal
                    ? 'border-line-strong bg-panel-3 text-ink-muted'
                    : 'border-accent/40 bg-accent/10 text-accent-fg'
                }`}
              >
                {item.tag}
              </span>

              <span className="text-ink-muted">
                <span className="text-ink">
                  {item.what}.
                </span>

                {!compact && <> {item.how}</>}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-ink-muted">
        Data sources have different geographic coverage,
        reporting periods and definitions. WHO reports and
        CDC surveillance must not be interpreted as one
        unified global case count. Original dashboard
        outbreak metrics remain simulated.
      </p>
    </div>
  );
}
