import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { DISEASE_BY_ID } from '../data/diseases.js';
import AlertItem from '../components/alerts/AlertItem.jsx';
import { RiskBadge } from '../components/common/Badges.jsx';
import Button from '../components/common/Button.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { DataStatusBar } from '../components/common/DataStatus.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Sparkline from '../components/common/Sparkline.jsx';
import ComparisonBars from '../components/charts/ComparisonBars.jsx';
import DonutChart from '../components/charts/DonutChart.jsx';
import SeriesChart from '../components/charts/SeriesChart.jsx';
import MetricCard from '../components/dashboard/MetricCard.jsx';
import GlobalMap from '../components/map/GlobalMap.jsx';
import useChartTheme from '../hooks/useChartTheme.js';
import { downloadCsv, OUTBREAK_COLUMNS, printReport } from '../services/exportService.js';
import { aggregateSeries, breakdown } from '../utils/aggregate.js';
import { formatCompact, formatPercent } from '../utils/format.js';
import { COUNTRY_BY_CODE } from '../data/countries.js';

export default function OverviewPage() {
  const t = useChartTheme();
  const { metricCards, countryRows, alerts, readSet, markRead, markUnread, selectCountry, selectedCode, outbreaks, dates, meta } = useApp();
  const [selectedDisease, setSelectedDisease] = useState(null);

  const trend = useMemo(() => aggregateSeries(outbreaks, dates, { days: 180, granularity: 'weekly', groupBy: 'disease' }), [outbreaks, dates]);
  const trendKeys = trend.keys.map((id) => ({ key: id, label: DISEASE_BY_ID[id].short, color: DISEASE_BY_ID[id].color }));
  const diseaseShare = useMemo(
    () =>
      breakdown(outbreaks, (o) => o.diseaseId, { days: 90 }).map((b) => ({
        key: b.key,
        name: DISEASE_BY_ID[b.key].short,
        value: b.cases,
        color: DISEASE_BY_ID[b.key].color,
      })),
    [outbreaks],
  );
  const regions = useMemo(
    () => breakdown(outbreaks, (o) => COUNTRY_BY_CODE[o.countryCode].region, { days: 90 }).map((b) => ({ name: b.key, current: b.cases, previous: b.previous })),
    [outbreaks],
  );
  const nowMs = new Date(meta.referenceTimestamp).getTime();
  const unread = alerts.filter((a) => !readSet.has(a.id));
  const latestAlerts = (unread.length ? unread : alerts).slice(0, 4);

  return (
    <>
      <PageHeader
        title="Global health intelligence"
        description="Monitor outbreaks, country risk and disease trends across 40 monitored countries. Every figure on this dashboard comes from a simulated demonstration dataset."
        actions={
          <>
            <Button icon={Download} onClick={() => downloadCsv('pulse19-outbreaks.csv', outbreaks, OUTBREAK_COLUMNS)}>
              Export CSV
            </Button>
            <Button icon={Printer} onClick={printReport}>
              Print report
            </Button>
          </>
        }
      >
        <DataStatusBar />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.id} card={card} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader
            title="Outbreak map"
            subtitle="Marker size shows cumulative reported cases. Colour shows risk level. Select a marker for country details."
            actions={
              <a href="#/map" className="text-sm font-medium text-accent-fg hover:underline">
                Open full map
              </a>
            }
            className="pb-4"
          />
          <GlobalMap rows={countryRows} metric="cases" selectedCode={selectedCode} onSelect={selectCountry} height={440} compact />
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Highest-risk countries" subtitle="Ranked by risk score" className="pb-3" />
          <ol className="divide-y divide-line">
            {countryRows.slice(0, 7).map((r, i) => (
              <li key={r.code}>
                <button type="button" onClick={() => selectCountry(r.code)} className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-panel-2">
                  <span className="w-4 text-xs tabular-nums text-ink-faint">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{r.name}</span>
                    <span className="block text-xs text-ink-muted">
                      {formatCompact(r.last30)} cases in 30 days, {formatPercent(r.changePct)}
                    </span>
                  </span>
                  <Sparkline data={r.spark} color={t.risk[r.risk.level]} width={64} height={24} />
                  <RiskBadge level={r.risk.level} />
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-auto border-t border-line px-5 py-3">
            <a href="#/countries" className="text-sm font-medium text-accent-fg hover:underline">
              View all countries
            </a>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="pb-4 xl:col-span-2">
          <CardHeader title="Weekly new cases" subtitle="All monitored countries, last 6 months, by disease" className="pb-3" />
          <div className="px-3">
            <SeriesChart data={trend.rows} keys={trendKeys} stacked height={300} ariaLabel="Weekly new cases by disease, last six months" />
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title={unread.length ? 'Unread alerts' : 'Latest alerts'} subtitle={`${unread.length} unread of ${alerts.length}`} className="pb-3" />
          <ul>
            {latestAlerts.map((a) => (
              <AlertItem
                key={a.id}
                alert={a}
                compact
                read={readSet.has(a.id)}
                nowMs={nowMs}
                onToggleRead={(id, isRead) => (isRead ? markUnread(id) : markRead(id))}
                onOpenCountry={selectCountry}
              />
            ))}
          </ul>
          <div className="mt-auto border-t border-line px-5 py-3">
            <a href="#/alerts" className="text-sm font-medium text-accent-fg hover:underline">
              Open alert centre
            </a>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">Cases by disease, last 90 days</h2>
          <DonutChart data={diseaseShare} centerLabel="Cases" selectedKey={selectedDisease} onSelect={(k) => setSelectedDisease((cur) => (cur === k ? null : k))} />
          {selectedDisease && (
            <a href={`#/diseases/${selectedDisease}`} className="mt-3 inline-block text-sm font-medium text-accent-fg hover:underline">
              Explore {DISEASE_BY_ID[selectedDisease].name}
            </a>
          )}
        </Card>
        <Card className="pb-4 xl:col-span-2">
          <CardHeader title="Regional comparison" subtitle="Cases in the last 90 days against the 90 days before" className="pb-3" />
          <div className="px-3">
            <ComparisonBars rows={regions} currentLabel="Last 90 days" previousLabel="Previous 90 days" height={260} ariaLabel="Cases by region, last 90 days against the previous 90 days" />
          </div>
        </Card>
      </div>
    </>
  );
}
