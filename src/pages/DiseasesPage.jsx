import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { COUNTRY_BY_CODE, REGIONS } from '../data/countries.js';
import { DiseaseDot, RiskBadge, TrendChip } from '../components/common/Badges.jsx';
import Button from '../components/common/Button.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Segmented from '../components/common/Segmented.jsx';
import Sparkline from '../components/common/Sparkline.jsx';
import ComparisonBars from '../components/charts/ComparisonBars.jsx';
import SeriesChart from '../components/charts/SeriesChart.jsx';
import GlobalMap from '../components/map/GlobalMap.jsx';
import { navigate } from '../hooks/useHashRoute.js';
import { COUNTRY_COLUMNS, downloadCsv } from '../services/exportService.js';
import { aggregateSeries, breakdown, buildCountryRows } from '../utils/aggregate.js';
import { formatCompact, formatInt } from '../utils/format.js';
import { RISK_KEYS, RISK_LEVELS } from '../utils/risk.js';

const REGION_COLORS = ['#f59e0b', '#fb923c', '#facc15', '#a8a29e', '#d6b88a'];

export default function DiseasesPage({ param }) {
  const { diseaseRows, dates, selectCountry, selectedCode } = useApp();
  const [days, setDays] = useState(180);

  const selected = diseaseRows.find((d) => d.id === param) ?? diseaseRows[0];
  const outbreaks = selected.outbreaks;

  const countries = useMemo(() => buildCountryRows(outbreaks), [outbreaks]);
  const trend = useMemo(() => aggregateSeries(outbreaks, dates, { days, granularity: days <= 90 ? 'daily' : 'weekly', groupBy: 'region' }), [outbreaks, dates, days]);
  const regional = useMemo(
    () => breakdown(outbreaks, (o) => COUNTRY_BY_CODE[o.countryCode].region, { days: 90 }).map((b) => ({ name: b.key, current: b.cases, previous: b.previous })),
    [outbreaks],
  );
  const regionKeys = trend.keys.map((r) => ({ key: r, label: r, color: REGION_COLORS[REGIONS.indexOf(r) % REGION_COLORS.length] }));
  const d = selected.disease;

  return (
    <>
      <PageHeader
        title="Disease monitoring"
        description="Track each disease across the monitored countries, with a consistent risk classification. Choose a disease to see where it is spreading and how it has moved."
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Diseases">
        {diseaseRows.map((row) => {
          const active = row.id === selected.id;
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => navigate(`/diseases/${row.id}`)}
                aria-pressed={active}
                className={`flex h-full w-full flex-col rounded-xl border p-4 text-left transition-colors ${
                  active ? 'border-accent/60 bg-accent/[0.06]' : 'border-line bg-panel hover:border-line-strong hover:bg-panel-2'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <DiseaseDot color={row.disease.color} />
                    {row.disease.short}
                  </span>
                  <RiskBadge level={row.risk.level} />
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums text-ink">{formatCompact(row.cases)}</p>
                <p className="text-xs text-ink-muted">reported cases, 12 months</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="text-xs text-ink-muted">
                    <p>
                      <span className="tabular-nums text-ink">{row.activeOutbreaks}</span> active outbreaks
                    </p>
                    <p>
                      in <span className="tabular-nums text-ink">{row.countries}</span> countries
                    </p>
                    <TrendChip trend={row.trend} pct={row.changePct} className="mt-1" />
                  </div>
                  <Sparkline data={row.spark} color={row.disease.color} width={84} height={34} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <section className="mt-8" aria-labelledby="disease-detail-title" key={selected.id}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id="disease-detail-title" className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-ink">
              <DiseaseDot color={d.color} className="h-3.5 w-3.5" />
              {d.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{d.summary}</p>
            <p className="mt-1 text-xs text-ink-muted">Transmission: {d.transmission}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RiskBadge level={selected.risk.level} />
            <Button icon={Download} onClick={() => downloadCsv(`pulse19-${d.id}-countries.csv`, countries, COUNTRY_COLUMNS)}>
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Reported cases', formatInt(selected.cases), '12 months'],
            ['Fatalities', formatInt(selected.deaths), `${selected.cases ? ((selected.deaths / selected.cases) * 100).toFixed(2) : 0}% of cases`],
            ['Last 30 days', formatInt(selected.last30), <TrendChip key="t" trend={selected.trend} pct={selected.changePct} />],
            ['Geographic spread', `${selected.countries} countries`, selected.regions.join(', ')],
          ].map(([label, value, sub]) => (
            <div key={label} className="rounded-xl border border-line bg-panel px-4 py-3">
              <p className="text-xs text-ink-muted">{label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>
              <div className="mt-0.5 text-xs text-ink-muted">{sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader title="Geographic distribution" subtitle={`Where ${d.short} is reported, sized by cumulative cases`} className="pb-4" />
            <GlobalMap rows={countries} metric="cases" selectedCode={selectedCode} onSelect={selectCountry} height={400} compact />
          </Card>
          <Card className="pb-4">
            <CardHeader
              title="Historical trend by region"
              subtitle="New cases over time"
              className="pb-3"
              actions={
                <Segmented
                  size="sm"
                  label="Time window"
                  value={String(days)}
                  onChange={(v) => setDays(Number(v))}
                  options={[
                    { value: '90', label: '90 days' },
                    { value: '180', label: '6 months' },
                    { value: '365', label: '12 months' },
                  ]}
                />
              }
            />
            <div className="px-3">
              <SeriesChart data={trend.rows} keys={regionKeys} stacked height={340} ariaLabel={`New ${d.short} cases over time by region`} />
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <Card className="pb-4">
            <CardHeader title="Regions, last 90 days" subtitle="Against the previous 90 days" className="pb-3" />
            <div className="px-3">
              <ComparisonBars rows={regional} currentLabel="Last 90 days" previousLabel="Previous 90 days" height={260} ariaLabel={`${d.short} cases by region`} />
            </div>
          </Card>
          <Card className="overflow-hidden xl:col-span-2">
            <CardHeader title="Most affected countries" subtitle="Ranked by cases in the last 30 days" className="pb-3" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-line text-xs text-ink-muted">
                  <tr>
                    <th className="px-5 py-2 font-medium">Country</th>
                    <th className="px-3 py-2 text-right font-medium">Cases (30 d)</th>
                    <th className="px-3 py-2 font-medium">Trend</th>
                    <th className="px-3 py-2 font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {[...countries]
                    .sort((a, b) => b.last30 - a.last30)
                    .slice(0, 8)
                    .map((r) => (
                      <tr key={r.code} onClick={() => selectCountry(r.code)} className="cursor-pointer border-b border-line last:border-b-0 hover:bg-panel-2">
                        <td className="px-5 py-2.5">
                          <button type="button" className="text-left font-medium text-ink" onClick={(e) => { e.stopPropagation(); selectCountry(r.code); }}>
                            {r.name}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-ink">{formatInt(r.last30)}</td>
                        <td className="px-3 py-2.5">
                          <TrendChip trend={r.trend} pct={r.changePct} />
                        </td>
                        <td className="px-3 py-2.5">
                          <RiskBadge level={r.risk.level} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      <Card className="mt-8 p-5">
        <h2 className="text-sm font-semibold text-ink">How risk is classified</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
          Every outbreak gets a score from 0 to 100 that combines recent burden (cases in the last 30 days), momentum (change against the previous 30 days) and the disease’s typical fatality ratio. Countries and diseases take their highest outbreak score, plus a small allowance for spread. The same four levels are used on the map, in tables and in alerts. This is a transparent demonstration heuristic, not a validated epidemiological model.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {RISK_KEYS.map((k) => (
            <li key={k} className="rounded-lg border border-line bg-panel-2 p-3">
              <RiskBadge level={k} />
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">{RISK_LEVELS[k].description}</p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
