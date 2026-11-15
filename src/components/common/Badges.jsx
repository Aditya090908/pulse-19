import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { formatPercent } from '../../utils/format.js';
import { RISK_LEVELS } from '../../utils/risk.js';

export function RiskBadge({ level, className = '' }) {
  const meta = RISK_LEVELS[level] ?? RISK_LEVELS.low;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

const TREND = {
  rising: { Icon: ArrowUpRight, cls: 'text-danger', label: 'Rising' },
  falling: { Icon: ArrowDownRight, cls: 'text-teal-600 dark:text-teal-300', label: 'Falling' },
  stable: { Icon: Minus, cls: 'text-ink-muted', label: 'Stable' },
};

export function TrendChip({ trend, pct, showLabel = true, className = '' }) {
  const meta = TREND[trend] ?? TREND.stable;
  const { Icon } = meta;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${meta.cls} ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {pct != null ? formatPercent(pct) : showLabel ? meta.label : null}
    </span>
  );
}

export function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        active ? 'border-accent/40 bg-accent/10 text-accent-fg' : 'border-line-strong bg-panel-3 text-ink-muted'
      }`}
    >
      {status}
    </span>
  );
}

export function DiseaseDot({ color, className = '' }) {
  return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-sm ${className}`} style={{ background: color }} aria-hidden="true" />;
}

/** Marks figures that are generated, so they are never mistaken for verified data. */
export function SimulatedTag({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[11px] font-medium text-accent-fg ${className}`}
      title="Generated demonstration data, not a live or verified source"
    >
      Simulated
    </span>
  );
}
