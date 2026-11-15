import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { COUNTRY_BY_CODE } from '../data/countries.js';
import { DISEASE_BY_ID } from '../data/diseases.js';
import { DISEASE_OPTIONS, REGION_OPTIONS } from '../data/options.js';
import { TrendChip, DiseaseDot } from '../components/common/Badges.jsx';
import Button from '../components/common/Button.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Segmented from '../components/common/Segmented.jsx';
import Select from '../components/common/Select.jsx';
import Sparkline from '../components/common/Sparkline.jsx';
import ComparisonBars from '../components/charts/ComparisonBars.jsx';
import DonutChart from '../components/charts/DonutChart.jsx';
import SeriesChart from '../components/charts/SeriesChart.jsx';
import useChartTheme from '../hooks/useChartTheme.js';
import { downloadCsv } from '../services/exportService.js';
import { GRANULARITIES, PERIODS, aggregateSeries, breakdown, countryOptions, filterOutbreaks, pctChange } from '../utils/aggregate.js';
import { formatCompact, formatInt } from '../utils/format.js';

const periodOptions = PERIODS.map((p) => ({ value: String(p.value), label: p.label }));

function MiniStat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-4 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {sub && <div className="mt-0.5 text-xs text-ink-muted">{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const t = useChartTheme();
  const { outbreaks, dates, countryRows } = useApp();
  const [diseaseId, setDiseaseId] = useState('all');
  const [region, setRegion] = useState('all');
  const [countryCode, setCountryCode] = useState('all');
  const [days, setDays] = useState(90);
  const [granularity, setGranularity] = useState('weekly');
  const [stackByDisease, setStackByDisease] = useState(true);
  const [chartType, setChartType] = useState('area');

  const countrySelect = useMemo(() => {
    const scoped = region === 'all' ? countryRows : countryRows.filter((r) => r.region === region);
    return [{ value: 'all', label: 'All countries' }, ...countryOptions(scoped)];
  }, [countryRows, region]);

  // A country outside the chosen region is no longer valid.
  useEffect(() => {
    if (countryCode !== 'all' && region !== 'all' && COUNTRY_BY_CODE[Number(countryCode)]?.region !== region) setCountryCode('all');
  }, [region, countryCode]);

  const filtered = useMemo(() => filterOutbreaks(outbreaks, { diseaseId, region, countryCode }), [outbreaks, diseaseId, region, countryCode]);
  const canStack = diseaseId === 'all';
  const groupBy = canStack && stackByDisease ? 'disease' : 'total';

  const cases = useMemo(() => aggregateSeries(filtered, dates, { days, granularity, groupBy }), [filtered, dates, days, granularity, groupBy]);
  const deaths = useMemo(() => aggregateSeries(filtered, dates, { days, granularity, metric: 'deaths' }), [filtered, dates, days, granularity]);
  const weeklyByDisease = useMemo(() => aggregateSeries(filtered, dates, { days, granularity: days <= 30 ? 'daily' : 'weekly', groupBy: 'disease' }), [filtered, dates, days]);
  const monthly = useMemo(() => aggregateSeries(filtered, dates, { days: 365, granularity: 'monthly', groupBy: 'disease' }), [filtered, dates]);
  const byDisease = useMemo(() => breakdown(filtered, (o) => o.diseaseId, { days }), [filtered, days]);
  const byRegion = useMemo(() => breakdown(filtered, (o) => COUNTRY_BY_CODE[o.countryCode].region, { days }), [filtered, days]);

  const keyMeta = (id) => ({ key: id, label: DISEASE_BY_ID[id]?.short ?? 'All selected', color: DISEASE_BY_ID[id]?.color ?? t.accent });
  const caseKeys = cases.keys.map((k) => (k === 'total' ? { key: 'total', label: diseaseId === 'all' ? 'All diseases' : DISEASE_BY_ID[diseaseId].short, color: DISEASE_BY_ID[diseaseId]?.color ?? t.accent } : keyMeta(k)));
  const monthlyKeys = monthly.keys.map(keyMeta);

  const totals = useMemo(() => {
    const sum = (rows) => rows.reduce((s, r) => s + r.cases, 0);
    const cur = sum(byDisease);
    const prev = byDisease.reduce((s, r) => s + r.previous, 0);
    return {
      cases: cur,
      deaths: byDisease.reduce((s, r) => s + r.deaths, 0),
      avg: cur / days,
      change: byDisease[0]?.hasPrevious ? pctChange(cur, prev) : null,
    };
  }, [byDisease, days]);

  const regionRows = byRegion.map((r) => ({ name: r.key, current: r.cases, previous: r.hasPrevious ? r.previous : undefined }));
  const donut = byDisease.map((b) => ({ key: b.key, name: DISEASE_BY_ID[b.key].short, value: b.cases, color: DISEASE_BY_ID[b.key].color }));

  const exportSeries = () => {
    const columns = [
      { label: 'period_start', value: (r) => r.date },
      ...cases.keys.map((k) => ({ label: k === 'total' ? 'cases_total' : `cases_${k}`, value: (r) => r[k] })),
      { label: 'cases_all', value: (r) => r.total },
    ];
    downloadCsv(`pulse19-case-trend-${days}d-${granularity}.csv`, cases.rows, columns);
  };

  const periodLabel = PERIODS.find((p) => p.value === days).label;

  return (
    <>
      <PageHeader
        title="Disease analytics"
        description="Compare trends across diseases, regions and countries. Filters apply to every chart on this page."
        actions={
          <Button icon={Download} onClick={exportSeries} disabled={!filtered.length}>
            Export trend CSV
          </Button>
        }
      />

      <Card className="mb-6 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Select label="Disease" value={diseaseId} onChange={setDiseaseId} options={DISEASE_OPTIONS} />
          <Select label="Region" value={region} onChange={setRegion} options={REGION_OPTIONS} />
          <Select label="Country" value={countryCode} onChange={setCountryCode} options={countrySelect} />
          <Select label="Time period" value={String(days)} onChange={(v) => setDays(Number(v))} options={periodOptions} />
          <Select label="Resolution" value={granularity} onChange={setGranularity} options={GRANULARITIES} />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No outbreaks match these filters"
            description="That combination of disease, region and country has no records in the simulated dataset. Widen one of the filters."
            action={
              <Button
                onClick={() => {
                  setDiseaseId('all');
                  setRegion('all');
                  setCountryCode('all');
                }}
              >
                Reset filters
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat label={`Cases, ${periodLabel.toLowerCase()}`} value={formatInt(totals.cases)} sub={`${filtered.length} outbreaks in selection`} />
            <MiniStat label={`Fatalities, ${periodLabel.toLowerCase()}`} value={formatInt(totals.deaths)} sub={`${totals.cases ? ((totals.deaths / totals.cases) * 100).toFixed(2) : '0.00'}% of cases`} />
            <MiniStat label="Average per day" value={formatInt(totals.avg)} sub="New cases" />
            <MiniStat
              label="Against previous period"
              value={totals.change == null ? 'Not available' : <TrendChip trend={totals.change > 10 ? 'rising' : totals.change < -10 ? 'falling' : 'stable'} pct={totals.change} />}
              sub={totals.change == null ? 'A 12-month window has no earlier period' : `Compared with the ${periodLabel.toLowerCase()} before`}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Card className="pb-4">
              <CardHeader
                title="Case trend"
                subtitle={`New reported cases, ${periodLabel.toLowerCase()}`}
                className="pb-3"
                actions={
                  <>
                    {canStack && (
                      <Segmented
                        size="sm"
                        label="Stack by disease"
                        value={stackByDisease ? 'stack' : 'total'}
                        onChange={(v) => setStackByDisease(v === 'stack')}
                        options={[
                          { value: 'stack', label: 'By disease' },
                          { value: 'total', label: 'Total' },
                        ]}
                      />
                    )}
                    <Segmented
                      size="sm"
                      label="Chart type"
                      value={chartType}
                      onChange={setChartType}
                      options={[
                        { value: 'area', label: 'Area' },
                        { value: 'bar', label: 'Bars' },
                      ]}
                    />
                  </>
                }
              />
              <div className="px-3">
                <SeriesChart data={cases.rows} keys={caseKeys} variant={chartType} stacked={groupBy === 'disease'} height={300} ariaLabel="New reported cases over time" />
              </div>
            </Card>

            <Card className="pb-4">
              <CardHeader title="Fatality trend" subtitle={`Reported fatalities, ${periodLabel.toLowerCase()}`} className="pb-3" />
              <div className="px-3">
                <SeriesChart
                  data={deaths.rows}
                  keys={[{ key: 'total', label: 'Fatalities', color: t.risk.critical }]}
                  variant="area"
                  height={300}
                  ariaLabel="Reported fatalities over time"
                />
              </div>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader title="Disease-wise trends" subtitle={`New cases per ${days <= 30 ? 'day' : 'week'} for each disease in the selection`} className="pb-3" />
            <ul className="grid gap-px overflow-hidden rounded-b-xl bg-line sm:grid-cols-2 xl:grid-cols-4">
              {byDisease.map((b) => {
                const d = DISEASE_BY_ID[b.key];
                const series = weeklyByDisease.rows.map((r) => r[b.key] ?? 0);
                const change = b.changePct;
                return (
                  <li key={b.key} className="bg-panel p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-ink">
                        <DiseaseDot color={d.color} />
                        {d.short}
                      </span>
                      {change != null && <TrendChip trend={change > 10 ? 'rising' : change < -10 ? 'falling' : 'stable'} pct={change} />}
                    </div>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-ink">{formatCompact(b.cases)}</p>
                    <Sparkline data={series} color={d.color} width={200} height={40} className="mt-1 w-full" label={`${d.name} trend`} />
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Card className="pb-4 xl:col-span-2">
              <CardHeader
                title="Regional comparison"
                subtitle={totals.change == null ? `Cases by region, ${periodLabel.toLowerCase()}` : `Cases by region against the ${periodLabel.toLowerCase()} before`}
                className="pb-3"
              />
              <div className="px-3">
                <ComparisonBars rows={regionRows} currentLabel={periodLabel} previousLabel={`Previous ${periodLabel.toLowerCase()}`} height={280} ariaLabel="Cases by region" />
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">Disease distribution</h2>
              <DonutChart data={donut} centerLabel="Cases" />
            </Card>
          </div>

          <Card className="mt-6 pb-4">
            <CardHeader
              title="Historical monthly burden"
              subtitle="Cases per month over the past 12 months, by disease. The first and latest months may be partial."
              className="pb-3"
            />
            <div className="px-3">
              <SeriesChart data={monthly.rows} keys={monthlyKeys} variant="bar" stacked height={300} ariaLabel="Monthly cases by disease over 12 months" />
            </div>
          </Card>
        </>
      )}
    </>
  );
}
