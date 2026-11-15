import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Download, Globe, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { DISEASE_BY_ID } from '../data/diseases.js';
import { DISEASE_OPTIONS, REGION_OPTIONS, RISK_OPTIONS } from '../data/options.js';
import { RiskBadge, TrendChip } from '../components/common/Badges.jsx';
import Button from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Select from '../components/common/Select.jsx';
import Sparkline from '../components/common/Sparkline.jsx';
import useChartTheme from '../hooks/useChartTheme.js';
import { COUNTRY_COLUMNS, downloadCsv, printReport } from '../services/exportService.js';
import { buildCountryRows, filterOutbreaks } from '../utils/aggregate.js';
import { formatDate, formatInt } from '../utils/format.js';

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: 'name', label: 'Country', align: 'left', get: (r) => r.name },
  { key: 'activeOutbreaks', label: 'Active outbreaks', align: 'right', get: (r) => r.activeOutbreaks },
  { key: 'cases', label: 'Reported cases', align: 'right', get: (r) => r.cases },
  { key: 'deaths', label: 'Fatalities', align: 'right', get: (r) => r.deaths },
  { key: 'changePct', label: 'Trend (30 days)', align: 'left', get: (r) => r.changePct },
  { key: 'risk', label: 'Risk level', align: 'left', get: (r) => r.risk.score },
  { key: 'lastReported', label: 'Last reported', align: 'left', get: (r) => r.lastReported },
];

export default function CountriesPage() {
  const t = useChartTheme();
  const { outbreaks, countryRows, selectCountry, selectedCode } = useApp();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [risk, setRisk] = useState('all');
  const [diseaseId, setDiseaseId] = useState('all');
  const [sort, setSort] = useState({ key: 'risk', dir: 'desc' });
  const [page, setPage] = useState(1);

  const baseRows = useMemo(() => (diseaseId === 'all' ? countryRows : buildCountryRows(filterOutbreaks(outbreaks, { diseaseId }))), [diseaseId, countryRows, outbreaks]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const col = COLUMNS.find((c) => c.key === sort.key);
    const filtered = baseRows.filter(
      (r) => (!q || r.name.toLowerCase().includes(q) || r.iso.toLowerCase() === q) && (region === 'all' || r.region === region) && (risk === 'all' || r.risk.level === risk),
    );
    const dir = sort.dir === 'asc' ? 1 : -1;
    return filtered.sort((a, b) => {
      const av = col.get(a);
      const bv = col.get(b);
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return cmp * dir || a.name.localeCompare(b.name);
    });
  }, [baseRows, query, region, risk, sort]);

  useEffect(() => setPage(1), [query, region, risk, diseaseId, sort]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' || key === 'lastReported' ? 'asc' : 'desc' }));

  return (
    <>
      <PageHeader
        title="Country intelligence"
        description="Compare countries by outbreak burden, momentum and risk. Select a row for the full briefing, including indicators and regional context."
        actions={
          <>
            <Button icon={Download} onClick={() => downloadCsv('pulse19-countries.csv', rows, COUNTRY_COLUMNS)} disabled={!rows.length}>
              Export CSV
            </Button>
            <Button icon={Printer} onClick={printReport}>
              Print report
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="grid gap-4 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <label htmlFor="country-search" className="mb-1 block text-xs font-medium text-ink-muted">
              Search countries
            </label>
            <input
              id="country-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or ISO code"
              className="w-full rounded-lg border border-line-strong bg-panel-2 px-3 py-2 text-sm text-ink placeholder:text-ink-faint hover:border-accent/50 focus:border-accent"
            />
          </div>
          <Select label="Region" value={region} onChange={setRegion} options={REGION_OPTIONS} />
          <Select label="Risk level" value={risk} onChange={setRisk} options={RISK_OPTIONS} />
          <Select label="Disease" value={diseaseId} onChange={setDiseaseId} options={DISEASE_OPTIONS} />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No countries match"
            description="Adjust the search or filters to see more of the simulated dataset."
            action={
              <Button
                onClick={() => {
                  setQuery('');
                  setRegion('all');
                  setRisk('all');
                  setDiseaseId('all');
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-b border-line bg-panel-2 text-xs text-ink-muted">
                  <tr>
                    {COLUMNS.map((c) => {
                      const active = sort.key === c.key;
                      return (
                        <th key={c.key} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={`px-4 py-2.5 font-medium ${c.align === 'right' ? 'text-right' : ''}`}>
                          <button
                            type="button"
                            onClick={() => toggleSort(c.key)}
                            className={`inline-flex items-center gap-1 rounded hover:text-ink ${c.align === 'right' ? 'flex-row-reverse' : ''} ${active ? 'text-accent-fg' : ''}`}
                          >
                            {c.label}
                            {active && (sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />)}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr
                      key={r.code}
                      onClick={() => selectCountry(r.code)}
                      className={`cursor-pointer border-b border-line transition-colors last:border-b-0 hover:bg-panel-2 ${selectedCode === r.code ? 'bg-panel-2' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <button type="button" onClick={(e) => { e.stopPropagation(); selectCountry(r.code); }} className="text-left">
                          <span className="block font-medium text-ink">{r.name}</span>
                          <span className="block text-xs text-ink-muted">
                            {r.region}, {r.diseaseIds.length} {r.diseaseIds.length === 1 ? 'disease' : 'diseases'}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">{r.activeOutbreaks}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">{formatInt(r.cases)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">{formatInt(r.deaths)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Sparkline data={r.spark} color={t.risk[r.risk.level]} width={64} height={24} />
                          <TrendChip trend={r.trend} pct={r.changePct} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge level={r.risk.level} />
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{formatDate(r.lastReported)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={current} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
          </>
        )}
      </Card>
      <p className="mt-3 text-xs text-ink-muted">
        Figures are simulated. Cases and fatalities cover the last 12 months
        {diseaseId !== 'all' ? ` for ${DISEASE_BY_ID[diseaseId].name}` : ''}.
      </p>
    </>
  );
}
