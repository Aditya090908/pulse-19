import { useEffect, useMemo, useRef } from 'react';
import { Download, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { DISEASE_BY_ID } from '../../data/diseases.js';
import { downloadCsv, OUTBREAK_COLUMNS } from '../../services/exportService.js';
import { aggregateSeries } from '../../utils/aggregate.js';
import { formatCompact, formatDate, formatInt, formatPercent, formatRelative, formatRatio } from '../../utils/format.js';
import { countryIndicators, countrySummary, regionContext } from '../../utils/insights.js';
import { RISK_LEVELS } from '../../utils/risk.js';
import { navigate } from '../../hooks/useHashRoute.js';
import { DiseaseDot, RiskBadge, SimulatedTag, StatusBadge, TrendChip } from '../common/Badges.jsx';
import Button from '../common/Button.jsx';
import SeriesChart from '../charts/SeriesChart.jsx';
import useChartTheme from '../../hooks/useChartTheme.js';
import CountryShape from './CountryShape.jsx';

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-line bg-panel-2 px-3 py-2.5">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{value}</p>
      {sub && <div className="mt-0.5 text-xs text-ink-muted">{sub}</div>}
    </div>
  );
}

function Section({ title, aside, children }) {
  return (
    <section className="border-t border-line px-5 py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function CountryPanel() {
  const { selectedCode, selectCountry, countryByCode, countryRows, dates, alerts, meta } = useApp();
  const t = useChartTheme();
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);
  const row = selectedCode != null ? countryByCode?.get(selectedCode) : null;
  const isOpen = Boolean(row);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && selectCountry(null);
    document.addEventListener('keydown', onKey);
    // Move focus into the dialog (not onto a button, so the key press that opened it cannot also activate it),
    // and hand focus back to whatever had it when the panel closes.
    returnFocusRef.current = document.activeElement;
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      const back = returnFocusRef.current;
      if (back && typeof back.focus === 'function' && document.contains(back)) back.focus();
    };
  }, [isOpen, selectCountry]);

  const model = useMemo(() => {
    if (!row) return null;
    const series = aggregateSeries(row.outbreaks, dates, { days: 180, granularity: 'weekly', groupBy: 'disease' });
    return {
      summary: countrySummary(row),
      indicators: countryIndicators(row, dates),
      region: regionContext(row, countryRows),
      series,
      keys: series.keys.map((id) => ({ key: id, label: DISEASE_BY_ID[id].short, color: DISEASE_BY_ID[id].color })),
      outbreaks: [...row.outbreaks].sort((a, b) => b.last30 - a.last30),
      alerts: alerts.filter((a) => a.countryCode === row.code).slice(0, 4),
    };
  }, [row, dates, countryRows, alerts]);

  if (!row || !model) return null;
  const nowMs = new Date(meta.referenceTimestamp).getTime();
  const close = () => selectCountry(null);

  return (
    <div className="pulse-print-hide fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="country-panel-title">
      <button type="button" aria-label="Close country details" tabIndex={-1} onClick={close} className="absolute inset-0 animate-fade-in bg-canvas/70 backdrop-blur-[2px]" />
      <aside ref={panelRef} tabIndex={-1} className="relative flex h-full w-full animate-slide-in-right outline-none focus:outline-none flex-col overflow-y-auto border-l border-line-strong bg-panel shadow-panel sm:w-[520px]">
        <header className="sticky top-0 z-10 flex items-start gap-4 border-b border-line bg-panel/95 px-5 py-4 backdrop-blur">
          <CountryShape code={row.code} color={t.risk[row.risk.level]} className="shrink-0 rounded-lg border border-line bg-panel-2" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-muted">{row.region}</p>
            <h2 id="country-panel-title" className="truncate text-xl font-semibold text-ink">
              {row.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RiskBadge level={row.risk.level} />
              <span className="text-xs tabular-nums text-ink-muted">Score {row.risk.score}/100</span>
              <TrendChip trend={row.trend} />
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              Reporting date: <span className="text-ink">{formatDate(row.lastReported)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-panel-3 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="px-5 py-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">Situation summary</h3>
            <SimulatedTag />
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">{model.summary}</p>
          <p className="mt-2 text-xs text-ink-faint">Generated by rules from the simulated figures, not written by an analyst.</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 px-5 pb-5 sm:grid-cols-3">
          <Stat label="Reported cases" value={formatCompact(row.cases)} sub="Last 12 months" />
          <Stat label="Fatalities" value={formatInt(row.deaths)} sub={`${formatRatio(row.deaths, row.cases, 2)} of cases`} />
          <Stat label="Recovered" value={formatCompact(row.recovered)} sub={`${formatRatio(row.recovered, row.cases, 0)} of cases`} />
          <Stat label="Active cases" value={formatCompact(row.active)} sub="Last 21 days, net of deaths" />
          <Stat label="Last 30 days" value={formatCompact(row.last30)} sub={<TrendChip trend={row.trend} pct={row.changePct} />} />
          <Stat label="Active outbreaks" value={row.activeOutbreaks} sub={`${row.outbreaks.length} tracked`} />
        </div>

        <Section title="Recent outbreak activity" aside={<span className="text-xs text-ink-muted">Weekly new cases, last 6 months</span>}>
          <SeriesChart data={model.series.rows} keys={model.keys} stacked height={210} ariaLabel={`Weekly new cases in ${row.name} by disease`} />
        </Section>

        <Section title="Affected diseases">
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-xs">
              <thead className="text-ink-muted">
                <tr>
                  <th className="px-1 py-1.5 font-medium">Disease</th>
                  <th className="px-1 py-1.5 text-right font-medium">Cases</th>
                  <th className="px-1 py-1.5 text-right font-medium">Deaths</th>
                  <th className="px-1 py-1.5 text-right font-medium">30-day change</th>
                  <th className="px-1 py-1.5 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                {model.outbreaks.map((o) => {
                  const d = DISEASE_BY_ID[o.diseaseId];
                  return (
                    <tr key={o.id} className="border-t border-line align-top">
                      <td className="px-1 py-2">
                        <span className="flex items-center gap-2 font-medium text-ink">
                          <DiseaseDot color={d.color} />
                          {d.short}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-ink-faint">
                          <StatusBadge status={o.status} />
                          first {formatDate(o.firstReported)}
                        </span>
                      </td>
                      <td className="px-1 py-2 text-right tabular-nums text-ink">{formatInt(o.cases)}</td>
                      <td className="px-1 py-2 text-right tabular-nums text-ink">{formatInt(o.deaths)}</td>
                      <td className="px-1 py-2 text-right">
                        <TrendChip trend={o.trend} pct={o.changePct} />
                      </td>
                      <td className="px-1 py-2">
                        <RiskBadge level={o.risk.level} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Indicators">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            {model.indicators.map((i) => (
              <div key={i.label} title={i.hint}>
                <dt className="text-xs text-ink-muted">{i.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">{i.value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Regional context">
          <p className="text-sm leading-relaxed text-ink-muted">
            Ranks <span className="font-semibold text-ink">#{model.region.rank}</span> of {model.region.of} monitored countries in {model.region.region} by cases in the last 30 days, and accounts for{' '}
            <span className="font-semibold text-ink">{formatPercent(model.region.share, { sign: false })}</span> of the region’s recent cases. Risk is rated {RISK_LEVELS[row.risk.level].label.toLowerCase()}: {RISK_LEVELS[row.risk.level].description.toLowerCase()}.
          </p>
        </Section>

        {model.alerts.length > 0 && (
          <Section
            title="Related alerts"
            aside={
              <button
                type="button"
                className="text-xs text-accent-fg hover:underline"
                onClick={() => {
                  close();
                  navigate('/alerts');
                }}
              >
                Open alert centre
              </button>
            }
          >
            <ul className="space-y-2.5">
              {model.alerts.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5 text-sm">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${RISK_LEVELS[a.severity].dot}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-ink">{a.title}</span>
                  <span className="shrink-0 text-xs text-ink-faint">{formatRelative(a.timestamp, nowMs)}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <div className="mt-auto flex flex-wrap gap-2 border-t border-line px-5 py-4">
          <Button icon={Download} onClick={() => downloadCsv(`pulse19-${row.iso.toLowerCase()}-outbreaks.csv`, row.outbreaks, OUTBREAK_COLUMNS)}>
            Export outbreaks CSV
          </Button>
          <Button variant="ghost" onClick={close}>
            Close
          </Button>
        </div>
      </aside>
    </div>
  );
}
