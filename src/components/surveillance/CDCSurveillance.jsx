
import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import {
  Activity,
  RefreshCw,
  Download,
  Search,
  Database,
  MapPin,
  Bug,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { fetchLatestCDCSurveillance } from '../../services/cdcApi';

const numberFormat = new Intl.NumberFormat('en-US');

const PAGE_SIZE = 100;

function formatNumber(value) {
  return value == null ? '—' : numberFormat.format(value);
}

function formatCompact(value) {
  if (value == null) return '—';

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function metricValue(metric) {
  return typeof metric?.value === 'number' &&
    Number.isFinite(metric.value)
    ? metric.value
    : null;
}

function metricLabel(metric) {
  if (metricValue(metric) !== null) {
    return formatNumber(metric.value);
  }

  return metric?.flag_meaning || 'Not available';
}

function sumMetric(records, key) {
  return records.reduce((sum, record) => {
    const value = metricValue(record[key]);
    return sum + (value ?? 0);
  }, 0);
}

function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon className="h-5 w-5 text-amber-500" />
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold">{title}</h3>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

      <div className="mt-5 h-72 w-full">
        {children}
      </div>
    </section>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm shadow-xl">
      <p className="mb-2 font-semibold text-white">{label}</p>

      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {formatNumber(item.value)}
        </p>
      ))}
    </div>
  );
}

export default function CDCSurveillance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('All reporting areas');
  const [selectedDisease, setSelectedDisease] = useState('');
  const [page, setPage] = useState(1);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const result = await fetchLatestCDCSurveillance();

      if (!Array.isArray(result.records)) {
        throw new Error('Invalid CDC API response');
      }

      setData(result);
    } catch (err) {
      setError(err.message || 'Unable to retrieve CDC data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const records = data?.records || [];

  const areas = useMemo(() => {
    return [
      ...new Set(
        records
          .map((record) => record.reporting_area)
          .filter(Boolean)
      ),
    ].sort();
  }, [records]);

  const diseases = useMemo(() => {
    return [
      ...new Set(
        records
          .map((record) => record.disease)
          .filter(Boolean)
      ),
    ].sort();
  }, [records]);

  useEffect(() => {
    if (
      diseases.length &&
      !diseases.includes(selectedDisease)
    ) {
      setSelectedDisease(diseases[0]);
    }
  }, [diseases, selectedDisease]);

  // Aggregate records by disease.
  const diseaseSummary = useMemo(() => {
    const grouped = new Map();

    records.forEach((record) => {
      const name = record.disease;

      if (!name) return;

      if (!grouped.has(name)) {
        grouped.set(name, {
          disease: name,
          ytd: 0,
          previousYtd: 0,
          currentWeek: 0,
          max52Week: 0,
          numericYtdRecords: 0,
        });
      }

      const item = grouped.get(name);

      const ytd = metricValue(record.cumulative_ytd);
      const previous = metricValue(
        record.previous_year_cumulative_ytd
      );
      const current = metricValue(record.current_week);
      const maximum = metricValue(record.previous_52_week_max);

      if (ytd !== null) {
        item.ytd += ytd;
        item.numericYtdRecords += 1;
      }

      if (previous !== null) {
        item.previousYtd += previous;
      }

      if (current !== null) {
        item.currentWeek += current;
      }

      if (maximum !== null) {
        item.max52Week += maximum;
      }
    });

    return [...grouped.values()];
  }, [records]);

  // Top 10 diseases by cumulative YTD.
  const topDiseases = useMemo(() => {
    return diseaseSummary
      .filter((item) => item.numericYtdRecords > 0)
      .sort((a, b) => b.ytd - a.ytd)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        shortName:
          item.disease.length > 24
            ? `${item.disease.slice(0, 22)}…`
            : item.disease,
      }));
  }, [diseaseSummary]);

  // Records for the selected disease.
  const selectedDiseaseRecords = useMemo(() => {
    return records.filter(
      (record) => record.disease === selectedDisease
    );
  }, [records, selectedDisease]);

  // Reporting-area comparison.
  const areaComparison = useMemo(() => {
    return selectedDiseaseRecords
      .map((record) => ({
        area: record.reporting_area,
        ytd: metricValue(record.cumulative_ytd),
        previousYtd: metricValue(
          record.previous_year_cumulative_ytd
        ),
        currentWeek: metricValue(record.current_week),
        max52Week: metricValue(record.previous_52_week_max),
      }))
      .filter(
        (item) =>
          item.ytd !== null ||
          item.previousYtd !== null ||
          item.currentWeek !== null ||
          item.max52Week !== null
      )
      .sort(
        (a, b) => (b.ytd ?? -1) - (a.ytd ?? -1)
      )
      .slice(0, 12);
  }, [selectedDiseaseRecords]);

  // Aggregate numeric values across reporting areas.
  const totalYtd = sumMetric(records, 'cumulative_ytd');
  const totalPreviousYtd = sumMetric(
    records,
    'previous_year_cumulative_ytd'
  );

  // Search and reporting-area filters.
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesArea =
        area === 'All reporting areas' ||
        record.reporting_area === area;

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        record.disease?.toLowerCase().includes(query) ||
        record.reporting_area?.toLowerCase().includes(query);

      return matchesArea && matchesSearch;
    });
  }, [records, area, search]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRecords.length / PAGE_SIZE)
  );

  const visibleRecords = filteredRecords.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // CSV export.
  function exportCSV() {
    const headers = [
      'Reporting Area',
      'Disease',
      'Year',
      'Week',
      'Current Week',
      'Current Week Flag',
      '52 Week Maximum',
      '52 Week Maximum Flag',
      'Cumulative YTD',
      'Cumulative YTD Flag',
      'Previous Year YTD',
      'Previous Year YTD Flag',
    ];

    const rows = filteredRecords.map((record) => [
      record.reporting_area,
      record.disease,
      record.mmwr_year,
      record.mmwr_week,
      record.current_week?.value ?? '',
      record.current_week?.flag ?? '',
      record.previous_52_week_max?.value ?? '',
      record.previous_52_week_max?.flag ?? '',
      record.cumulative_ytd?.value ?? '',
      record.cumulative_ytd?.flag ?? '',
      record.previous_year_cumulative_ytd?.value ?? '',
      record.previous_year_cumulative_ytd?.flag ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? '').replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `pulse19-cdc-week-${data?.reporting_week || 'latest'}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="h-5 w-5 animate-spin" />
        Loading CDC surveillance data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <h2 className="font-semibold text-red-500">
          CDC data unavailable
        </h2>

        <p className="mt-2 text-sm">{error}</p>

        <button
          onClick={loadData}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="space-y-6 text-slate-900 dark:text-slate-100">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
              <Activity className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                CDC Disease Surveillance
              </h1>

              <p className="text-sm text-slate-500">
                National Notifiable Diseases Surveillance System
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Real CDC surveillance data across US reporting jurisdictions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Data status */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-green-500/10 px-3 py-1 font-medium text-green-600">
          LIVE API DATA
        </span>

        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-600">
          Provisional
        </span>

        <span className="text-slate-500">
          Reporting period: {data.reporting_year}, Week {data.reporting_week}
        </span>

        <span className="text-slate-500">
          Updated:{' '}
          {data.fetched_at
            ? new Date(data.fetched_at).toLocaleString()
            : '—'}
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Records fetched"
          value={formatNumber(data.record_count)}
          detail={
            data.pagination?.complete
              ? 'All pages retrieved'
              : 'Incomplete retrieval'
          }
          icon={Database}
        />

        <StatCard
          label="Reporting areas"
          value={formatNumber(areas.length)}
          detail="US reporting jurisdictions"
          icon={MapPin}
        />

        <StatCard
          label="Disease categories"
          value={formatNumber(diseases.length)}
          detail="Reported disease categories"
          icon={Bug}
        />

        <StatCard
          label="Pagination status"
          value={data.pagination?.complete ? 'Complete' : 'Incomplete'}
          detail={`${formatNumber(data.pagination?.records_fetched)} records retrieved`}
          icon={CheckCircle2}
        />
      </div>

      {/* Disease charts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        <ChartCard
          title="Top 10 diseases by cumulative YTD"
          description="Summed numeric YTD values across reporting areas. Categories may overlap."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topDiseases}
              layout="vertical"
              margin={{ left: 12, right: 28, top: 5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                horizontal={false}
              />

              <XAxis
                type="number"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={formatCompact}
              />

              <YAxis
                type="category"
                dataKey="shortName"
                width={175}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />

              <Tooltip content={<ChartTooltip />} />

              <Bar
                dataKey="ytd"
                name="Cumulative YTD"
                fill="#f59e0b"
                radius={[0, 5, 5, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="YTD comparison by disease"
          description="Current reporting year versus previous-year cumulative YTD."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topDiseases}
              margin={{ top: 8, right: 12, bottom: 35 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
              />

              <XAxis
                dataKey="shortName"
                angle={-30}
                textAnchor="end"
                interval={0}
                tick={{ fill: '#94a3b8', fontSize: 9 }}
              />

              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={formatCompact}
              />

              <Tooltip content={<ChartTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{
                  fontSize: '12px',
                  paddingBottom: '12px',
                }}
              />

              <Bar
                dataKey="ytd"
                name="Current YTD"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="previousYtd"
                name="Previous YTD"
                fill="#64748b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Reporting-area comparison */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">
              Reporting-area comparison
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Compare cumulative YTD cases for a selected disease.
            </p>
          </div>

          <select
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="max-w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
          >
            {diseases.map((disease) => (
              <option key={disease} value={disease}>
                {disease}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={areaComparison}
              margin={{ left: 8, right: 20, bottom: 35 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
              />

              <XAxis
                dataKey="area"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                angle={-25}
                textAnchor="end"
                interval={0}
                height={65}
              />

              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={formatCompact}
              />

              <Tooltip content={<ChartTooltip />} />

              <Legend />

              <Bar
                dataKey="ytd"
                name="Current YTD"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="previousYtd"
                name="Previous YTD"
                fill="#64748b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Current week vs 52-week maximum */}
      <ChartCard
        title="Current week vs 52-week maximum"
        description={`CDC reported values for ${selectedDisease || 'the selected disease'} across reporting areas. The maximum is a reference value, not a historical trend.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={areaComparison}
            margin={{ top: 8, right: 20, bottom: 35 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
            />

            <XAxis
              dataKey="area"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              angle={-25}
              textAnchor="end"
              interval={0}
              height={65}
            />

            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={formatCompact}
            />

            <Tooltip content={<ChartTooltip />} />

            <Legend />

            <Bar
              dataKey="currentWeek"
              name="Current week"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="max52Week"
              name="Previous 52-week maximum"
              fill="#64748b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Surveillance records */}
      <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">

        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h3 className="font-semibold">
              CDC surveillance records
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Search and filter the complete fetched reporting period.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search diseases..."
                className="w-56 rounded-lg border border-slate-300 bg-transparent py-2 pl-9 pr-3 text-sm dark:border-slate-700"
              />
            </div>

            <select
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            >
              <option value="All reporting areas">
                All reporting areas
              </option>

              {areas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">

            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="p-4">Reporting area</th>
                <th className="p-4">Disease</th>
                <th className="p-4">Current week</th>
                <th className="p-4">52-week max</th>
                <th className="p-4">Cumulative YTD</th>
                <th className="p-4">Previous YTD</th>
              </tr>
            </thead>

            <tbody>
              {visibleRecords.map((record, index) => (
                <tr
                  key={`${record.reporting_area}-${record.disease}-${index}`}
                  className="border-t border-slate-200 dark:border-slate-800"
                >
                  <td className="p-4 font-medium">
                    {record.reporting_area}
                  </td>

                  <td className="max-w-sm p-4">
                    {record.disease}
                  </td>

                  <td className="p-4">
                    {metricLabel(record.current_week)}
                  </td>

                  <td className="p-4">
                    {metricLabel(record.previous_52_week_max)}
                  </td>

                  <td className="p-4">
                    {metricLabel(record.cumulative_ytd)}
                  </td>

                  <td className="p-4">
                    {metricLabel(record.previous_year_cumulative_ytd)}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {filteredRecords.length === 0 && (
          <p className="p-8 text-center text-slate-500">
            No matching records found.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 dark:border-slate-800">

          <p className="text-xs text-slate-500">
            Showing{' '}
            {filteredRecords.length
              ? (page - 1) * PAGE_SIZE + 1
              : 0}
            –
            {Math.min(page * PAGE_SIZE, filteredRecords.length)} of{' '}
            {formatNumber(filteredRecords.length)} records
          </p>

          <div className="flex items-center gap-2">

            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs disabled:opacity-40 dark:border-slate-700"
            >
              Previous
            </button>

            <span className="text-xs text-slate-500">
              Page {page} of {pageCount}
            </span>

            <button
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs disabled:opacity-40 dark:border-slate-700"
            >
              Next
            </button>

          </div>
        </div>
      </section>

      {/* Source and interpretation */}
      <div className="rounded-xl border border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800">

        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          Data interpretation
        </div>

        <p className="mt-2">
          Source: CDC National Notifiable Diseases Surveillance System
          (NNDSS). Figures are provisional and may be revised.
          A missing numeric value is not automatically zero;
          CDC reporting flags are retained in the source data.
        </p>

        <p className="mt-2">
          Disease-category totals are sums across reporting areas.
          Some CDC categories may overlap, so different disease
          categories must not be added together as a unique
          national case total.
        </p>

        <p className="mt-2">
          The 52-week maximum is a reference maximum, not a
          historical weekly time series.
        </p>

        <a
          href={data.source_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-blue-500 hover:underline"
        >
          View original CDC dataset ↗
        </a>
      </div>

    </main>
  );
}
