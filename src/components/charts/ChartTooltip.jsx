import { formatInt } from '../../utils/format.js';

export default function ChartTooltip({ active, payload, label, valueFormatter = formatInt, showTotal = false, labelFormatter }) {
  if (!active || !payload?.length) return null;
  const items = payload
    .filter((p) => p.value != null)
    .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
  const total = items.reduce((s, p) => s + (Number(p.value) || 0), 0);
  return (
    <div className="min-w-[150px] max-w-[260px] rounded-lg border border-line-strong bg-panel-2 px-3 py-2 text-xs shadow-panel">
      <div className="mb-1.5 font-medium text-ink">{labelFormatter ? labelFormatter(label, payload) : label}</div>
      <ul className="space-y-1">
        {items.map((p) => (
          <li key={p.dataKey ?? p.name} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: p.color || p.fill || p.stroke }} aria-hidden="true" />
            <span className="truncate text-ink-muted">{p.name}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums text-ink">{valueFormatter(p.value)}</span>
          </li>
        ))}
      </ul>
      {showTotal && items.length > 1 && (
        <div className="mt-1.5 flex items-center justify-between border-t border-line pt-1.5">
          <span className="text-ink-muted">Total</span>
          <span className="font-semibold tabular-nums text-ink">{valueFormatter(total)}</span>
        </div>
      )}
    </div>
  );
}

export function ChartLegend({ payload }) {
  if (!payload?.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 px-2 text-xs text-ink-muted">
      {payload.map((entry) => (
        <li key={entry.dataKey ?? entry.value} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: entry.color }} aria-hidden="true" />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}
