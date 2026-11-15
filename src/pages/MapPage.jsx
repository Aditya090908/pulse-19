import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { DISEASE_OPTIONS, REGION_OPTIONS, RISK_OPTIONS } from '../data/options.js';
import { RiskBadge } from '../components/common/Badges.jsx';
import { Card } from '../components/common/Card.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Segmented from '../components/common/Segmented.jsx';
import Select from '../components/common/Select.jsx';
import GlobalMap from '../components/map/GlobalMap.jsx';
import { MAP_METRICS, getMapMetric } from '../components/map/mapMetrics.js';
import { buildCountryRows, filterOutbreaks, summarize } from '../utils/aggregate.js';
import { formatCompact, formatInt } from '../utils/format.js';

export default function MapPage() {
  const { outbreaks, selectCountry, selectedCode } = useApp();
  const [diseaseId, setDiseaseId] = useState('all');
  const [region, setRegion] = useState('all');
  const [risk, setRisk] = useState('all');
  const [metric, setMetric] = useState('cases');
  const metricMeta = getMapMetric(metric);

  const rows = useMemo(() => {
    const built = buildCountryRows(filterOutbreaks(outbreaks, { diseaseId, region }));
    return risk === 'all' ? built : built.filter((r) => r.risk.level === risk);
  }, [outbreaks, diseaseId, region, risk]);

  const ranked = useMemo(() => [...rows].sort((a, b) => metricMeta.get(b) - metricMeta.get(a)), [rows, metricMeta]);
  const totals = useMemo(() => summarize(rows.flatMap((r) => r.outbreaks)), [rows]);

  return (
    <>
      <PageHeader
        title="Global outbreak map"
        description="Explore where outbreaks are concentrated. Zoom and pan the map, hover a marker for a summary, and select it for the full country briefing."
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <Select label="Disease" value={diseaseId} onChange={setDiseaseId} options={DISEASE_OPTIONS} />
          <Select label="Region" value={region} onChange={setRegion} options={REGION_OPTIONS} />
          <Select label="Risk level" value={risk} onChange={setRisk} options={RISK_OPTIONS} />
          <div>
            <span className="mb-1 block text-xs font-medium text-ink-muted">Marker size</span>
            <Segmented label="Marker size metric" options={MAP_METRICS.map((m) => ({ value: m.value, label: m.label }))} value={metric} onChange={setMetric} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <GlobalMap rows={rows} metric={metric} selectedCode={selectedCode} onSelect={selectCountry} region={region} height={640} />
        </Card>

        <Card className="flex max-h-[640px] flex-col">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">In view</h2>
            <p className="mt-1 text-xs text-ink-muted">
              {rows.length} countries, {formatInt(totals.activeOutbreaks)} active outbreaks, {formatCompact(totals.cases)} cases
            </p>
          </div>
          {ranked.length === 0 ? (
            <EmptyState title="No matching countries" description="Try a different disease, region or risk level." />
          ) : (
            <ol className="flex-1 divide-y divide-line overflow-y-auto">
              {ranked.map((r) => (
                <li key={r.code}>
                  <button
                    type="button"
                    onClick={() => selectCountry(r.code)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-panel-2 ${selectedCode === r.code ? 'bg-panel-2' : ''}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{r.name}</span>
                      <span className="block text-xs text-ink-muted">
                        {metricMeta.label}: <span className="tabular-nums text-ink">{formatCompact(metricMeta.get(r))}</span>
                      </span>
                    </span>
                    <RiskBadge level={r.risk.level} />
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
