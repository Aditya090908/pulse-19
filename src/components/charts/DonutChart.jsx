import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCompact, formatInt } from '../../utils/format.js';
import ChartTooltip from './ChartTooltip.jsx';

/** Share chart. data: [{ key, name, value, color }] */
export default function DonutChart({ data, centerLabel = 'Total', selectedKey, onSelect, height = 220 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative w-full max-w-[220px] shrink-0" style={{ height }} role="img" aria-label={`${centerLabel} by category`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="94%"
              paddingAngle={2}
              stroke="none"
              onClick={onSelect ? (d) => onSelect(d?.payload?.key ?? d?.key) : undefined}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} fillOpacity={selectedKey && selectedKey !== d.key ? 0.35 : 1} cursor={onSelect ? 'pointer' : 'default'} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip valueFormatter={formatInt} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums text-ink">{formatCompact(total)}</span>
          <span className="text-xs text-ink-muted">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-1">
        {data.map((d) => {
          const share = total ? (d.value / total) * 100 : 0;
          const Row = onSelect ? 'button' : 'div';
          return (
            <li key={d.key}>
              <Row
                {...(onSelect ? { type: 'button', onClick: () => onSelect(d.key), 'aria-pressed': selectedKey === d.key } : {})}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs ${
                  onSelect ? 'hover:bg-panel-3' : ''
                } ${selectedKey === d.key ? 'bg-panel-3' : ''}`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} aria-hidden="true" />
                <span className="truncate text-ink">{d.name}</span>
                <span className="ml-auto pl-2 tabular-nums text-ink-muted">{formatCompact(d.value)}</span>
                <span className="w-10 text-right tabular-nums text-ink-faint">{share.toFixed(0)}%</span>
              </Row>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
