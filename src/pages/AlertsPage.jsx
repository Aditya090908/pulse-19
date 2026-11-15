
import { useMemo, useState } from 'react';
import { Bell, CheckCheck, Download } from 'lucide-react';

import { useApp } from '../context/AppContext.jsx';
import AlertItem from '../components/alerts/AlertItem.jsx';
import WHOReports from '../components/alerts/WHOReports.jsx';

import Button from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Segmented from '../components/common/Segmented.jsx';
import Select from '../components/common/Select.jsx';

import { ALERT_COLUMNS, downloadCsv } from '../services/exportService.js';
import { ALERT_TYPES } from '../utils/alerts.js';
import { RISK_KEYS, RISK_LEVELS } from '../utils/risk.js';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...Object.entries(ALERT_TYPES).map(([value, t]) => ({
    value,
    label: t.label,
  })),
];

const PAGE_STEP = 15;

export default function AlertsPage() {
  const {
    alerts,
    readSet,
    unreadCount,
    markRead,
    markUnread,
    markAllRead,
    selectCountry,
    meta,
  } = useApp();

  const [severity, setSeverity] = useState('all');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [shown, setShown] = useState(PAGE_STEP);

  const nowMs = new Date(meta.referenceTimestamp).getTime();

  // Existing simulated alerts and filters remain unchanged.
  const filtered = useMemo(
    () =>
      alerts.filter(
        (a) =>
          (severity === 'all' || a.severity === severity) &&
          (type === 'all' || a.type === type) &&
          (status === 'all' || !readSet.has(a.id)),
      ),
    [alerts, severity, type, status, readSet],
  );

  const stats = useMemo(
    () => ({
      critical: alerts.filter((a) => a.severity === 'critical').length,
      last24: alerts.filter(
        (a) =>
          nowMs - new Date(a.timestamp).getTime() <=
          24 * 3600 * 1000,
      ).length,
    }),
    [alerts, nowMs],
  );

  const reset = (setter) => (value) => {
    setter(value);
    setShown(PAGE_STEP);
  };

  return (
    <>
      <PageHeader
        title="Alert centre"
        description="Monitor official WHO outbreak reports alongside locally generated demonstration alerts. Real reports and simulated alerts are kept separate."
        actions={
          <>
            <Button
              icon={CheckCheck}
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>

            <Button
              icon={Download}
              onClick={() =>
                downloadCsv(
                  'pulse19-alerts.csv',
                  filtered,
                  ALERT_COLUMNS,
                )
              }
              disabled={!filtered.length}
            >
              Export CSV
            </Button>
          </>
        }
      />

      {/* REAL WHO OUTBREAK REPORTS */}
      <WHOReports />

      {/* EXISTING SIMULATED ALERT STATISTICS */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Unread', unreadCount],
          ['Critical', stats.critical],
          ['Last 24 hours', stats.last24],
          ['Total alerts', alerts.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-line bg-panel px-4 py-3"
          >
            <p className="text-xs text-ink-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* EXISTING SIMULATED ALERT FILTERS */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-end gap-4 border-b border-line p-4">
          <div>
            <span className="mb-1 block text-xs font-medium text-ink-muted">
              Severity
            </span>

            <Segmented
              size="sm"
              label="Severity"
              value={severity}
              onChange={reset(setSeverity)}
              options={[
                { value: 'all', label: 'All' },
                ...RISK_KEYS.map((k) => ({
                  value: k,
                  label: RISK_LEVELS[k].label,
                })),
              ]}
            />
          </div>

          <Select
            label="Alert type"
            value={type}
            onChange={reset(setType)}
            options={TYPE_OPTIONS}
            className="w-52"
          />

          <div>
            <span className="mb-1 block text-xs font-medium text-ink-muted">
              Status
            </span>

            <Segmented
              size="sm"
              label="Read status"
              value={status}
              onChange={reset(setStatus)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'unread', label: 'Unread' },
              ]}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={
              status === 'unread' &&
              severity === 'all' &&
              type === 'all'
                ? 'You are all caught up'
                : 'No alerts match these filters'
            }
            description={
              status === 'unread' &&
              severity === 'all' &&
              type === 'all'
                ? 'There are no unread alerts. Switch to All to review earlier ones.'
                : 'Try a different severity, type or read status.'
            }
          />
        ) : (
          <>
            <ul>
              {filtered.slice(0, shown).map((a) => (
                <AlertItem
                  key={a.id}
                  alert={a}
                  read={readSet.has(a.id)}
                  nowMs={nowMs}
                  onToggleRead={(id, isRead) =>
                    isRead ? markUnread(id) : markRead(id)
                  }
                  onOpenCountry={(code) => {
                    markRead(a.id);
                    selectCountry(code);
                  }}
                />
              ))}
            </ul>

            {filtered.length > shown && (
              <div className="border-t border-line p-4 text-center">
                <Button
                  onClick={() =>
                    setShown((n) => n + PAGE_STEP)
                  }
                >
                  Show {Math.min(
                    PAGE_STEP,
                    filtered.length - shown,
                  )} more
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      <p className="mt-3 text-xs text-ink-muted">
        WHO reports are retrieved from the official WHO API.
        Existing dashboard alerts are generated from simulated
        demonstration data. Read and unread states are stored
        in this browser only.
      </p>
    </>
  );
}
