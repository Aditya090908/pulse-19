import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useChartTheme from '../../hooks/useChartTheme.js';
import { formatCompact } from '../../utils/format.js';
import ChartTooltip, { ChartLegend } from './ChartTooltip.jsx';

/** Grouped bars comparing a current period with the one before it. rows: [{ name, current, previous? }] */
export default function ComparisonBars({ rows, currentLabel = 'Current period', previousLabel = 'Previous period', height = 280, ariaLabel }) {
  const t = useChartTheme();
  const hasPrevious = rows.some((r) => r.previous != null);
  return (
    <div style={{ height }} className="w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barGap={3}>
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: t.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: t.grid }} interval={0} />
          <YAxis tickFormatter={formatCompact} tick={{ fill: t.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
          <Tooltip content={<ChartTooltip valueFormatter={formatCompact} />} cursor={{ fill: t.cursor }} />
          {hasPrevious && <Legend content={<ChartLegend />} />}
          {hasPrevious && <Bar dataKey="previous" name={previousLabel} fill={t.previous} radius={[3, 3, 0, 0]} maxBarSize={28} />}
          <Bar dataKey="current" name={currentLabel} fill={t.accent} radius={[3, 3, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
