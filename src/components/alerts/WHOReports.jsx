
import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardHeader } from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { fetchWhoReports } from '../../services/whoApi.js';
import { formatDateTime } from '../../utils/format.js';

function getReportUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value, 'https://www.who.int');
    if (url.hostname !== 'www.who.int') return null;
    return url.href;
  } catch {
    return null;
  }
}

function getReportText(report) {
  return (
    report.summary ||
    report.overview ||
    report.epidemiology ||
    report.assessment ||
    'WHO has not provided a summary for this report.'
  );
}

export default function WHOReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastFetched, setLastFetched] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await fetchWhoReports(20);
      setReports(result.data);
      setLastFetched(new Date());
    } catch (err) {
      setError(err.message || 'Unable to load WHO reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader
        title="WHO outbreak intelligence"
        subtitle="Official outbreak reports published by the World Health Organization. These are reports, not a complete global case-count database."
        actions={
          <Button
            size="sm"
            icon={RefreshCw}
            onClick={loadReports}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh reports'}
          </Button>
        }
      />

      <div className="px-5 pb-4 pt-3">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full border border-teal-500/40 bg-teal-500/10 px-2.5 py-1 font-medium text-teal-700 dark:text-teal-300">
            OFFICIAL WHO SOURCE
          </span>

          <span className="text-ink-muted">
            {reports.length} reports loaded
          </span>

          {lastFetched && (
            <span className="text-ink-muted">
              Fetched {formatDateTime(lastFetched)}
            </span>
          )}
        </div>

        {error && (
          <div
            className="mb-4 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-ink"
            role="alert"
          >
            {error}
            {reports.length > 0 && (
              <span className="block mt-1 text-xs text-ink-muted">
                Showing previously loaded reports.
              </span>
            )}
          </div>
        )}

        {loading && reports.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            Fetching official WHO outbreak reports…
          </p>
        ) : reports.length === 0 ? (
          <EmptyState
            title="No WHO reports available"
            description="Check your backend connection and try refreshing."
          />
        ) : (
          <div className="divide-y divide-line">
            {reports.map((report) => {
              const url = getReportUrl(report.source_url);

              return (
                <article key={report.id} className="py-4 first:pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-teal-700 dark:text-teal-300">
                      World Health Organization
                    </span>

                    <span className="text-xs text-ink-muted">
                      {formatDateTime(report.publication_date)}
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-semibold leading-relaxed text-ink">
                    {report.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-ink-muted line-clamp-4">
                    {getReportText(report)}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-ink-faint">
                      Official outbreak report · Not simulated
                    </span>

                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-fg hover:underline"
                      >
                        Read WHO report
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
