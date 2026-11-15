import { Activity, Globe, Skull, Users } from 'lucide-react';
import useChartTheme from '../../hooks/useChartTheme.js';
import { formatInt, formatPercent } from '../../utils/format.js';
import { RISK_LEVELS } from '../../utils/risk.js';
import Sparkline from '../common/Sparkline.jsx';

const ICONS = { outbreaks: Activity, countries: Globe, cases: Users, deaths: Skull };

// Plain-language status for each severity band on a metric.
const STATUS = { critical: 'Sharp rise', high: 'Rising', moderate: 'Holding steady', low: 'Improving' };

export default function MetricCard({ card }) {
  const t = useChartTheme();
  const Icon = ICONS[card.id];
  const sev = RISK_LEVELS[card.severity];
  const color = t.risk[card.severity];
  const sign = card.delta.abs > 0 ? '+' : card.delta.abs < 0 ? '−' : '';
  return (
    <article className="flex flex-col rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
          {card.label}
        </h2>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${sev.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} aria-hidden="true" />
          {STATUS[card.severity]}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-ink">{formatInt(card.value)}</p>
        <Sparkline data={card.series} color={color} width={104} height={36} label={`${card.label}, last 30 days`} />
      </div>
      <p className="mt-1 text-xs text-ink-muted">{card.detail}</p>
      <p className="mt-3 border-t border-line pt-3 text-xs text-ink-muted">
        <span className="font-semibold tabular-nums" style={{ color }}>
          {formatPercent(card.delta.pct)}
        </span>{' '}
        <span title={`${sign}${formatInt(Math.abs(card.delta.abs))} ${card.delta.unit}`}>
          ({sign}
          {formatInt(Math.abs(card.delta.abs))} {card.delta.unit})
        </span>{' '}
        {card.delta.label}
      </p>
    </article>
  );
}
