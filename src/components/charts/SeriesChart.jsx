import { useId } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useChartTheme from '../../hooks/useChartTheme.js';
import { formatCompact } from '../../utils/format.js';
import ChartTooltip, { ChartLegend } from './ChartTooltip.jsx';

/**
 * Time-series chart. `keys` is [{ key, label, color }]; `data` rows carry a `label` field for the x axis.
 */
export default function SeriesChart({
  data,
  keys,
  variant = 'area',
  stacked = false,
  height = 280,
  valueFormatter = formatCompact,
  tooltipFormatter,
  showLegend = true,
  showTotal,
  ariaLabel,
}) {
  const t = useChartTheme();
  const uid = useId().replace(/:/g, '');
  const Chart = variant === 'bar' ? BarChart : variant === 'line' ? LineChart : AreaChart;
  const total = showTotal ?? (stacked && keys.length > 1);

  return (
    <div style={{ height }} className="w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            {keys.map((k) => (
              <linearGradient key={k.key} id={`fill-${uid}-${k.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={k.color} stopOpacity={stacked ? 0.7 : 0.35} />
                <stop offset="100%" stopColor={k.color} stopOpacity={stacked ? 0.35 : 0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: t.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: t.grid }}
            minTickGap={28}
            padding={variant === 'bar' ? { left: 4, right: 4 } : undefined}
          />
          <YAxis tickFormatter={valueFormatter} tick={{ fill: t.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            content={<ChartTooltip valueFormatter={tooltipFormatter ?? valueFormatter} showTotal={total} />}
            cursor={variant === 'bar' ? { fill: t.cursor } : { stroke: t.axis, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          {showLegend && keys.length > 1 && <Legend content={<ChartLegend />} />}
          {keys.map((k) => {
            if (variant === 'bar') {
              return <Bar key={k.key} dataKey={k.key} name={k.label} fill={k.color} stackId={stacked ? 'stack' : undefined} maxBarSize={36} radius={stacked ? 0 : [3, 3, 0, 0]} />;
            }
            if (variant === 'line') {
              return <Line key={k.key} type="monotone" dataKey={k.key} name={k.label} stroke={k.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />;
            }
            return (
              <Area
                key={k.key}
                type="monotone"
                dataKey={k.key}
                name={k.label}
                stackId={stacked ? 'stack' : undefined}
                stroke={k.color}
                strokeWidth={1.6}
                fill={`url(#fill-${uid}-${k.key})`}
                activeDot={{ r: 4 }}
              />
            );
          })}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
