import useChartTheme from '../../hooks/useChartTheme.js';
import { RISK_KEYS, RISK_LEVELS } from '../../utils/risk.js';
import { SimulatedTag } from '../common/Badges.jsx';

export default function MapLegend({ metricLabel, compact = false }) {
  const t = useChartTheme();
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[500] max-w-[220px] rounded-lg border border-line-strong bg-panel/90 p-3 text-xs shadow-panel backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-medium text-ink">Risk level</span>
        <SimulatedTag />
      </div>
      <ul className="space-y-1.5">
        {RISK_KEYS.map((key) => (
          <li key={key} className="flex items-center gap-2 text-ink-muted">
            <span className="h-2.5 w-2.5 rounded-full border" style={{ background: `${t.risk[key]}55`, borderColor: t.risk[key] }} aria-hidden="true" />
            {RISK_LEVELS[key].label}
          </li>
        ))}
      </ul>
      {!compact && (
        <div className="mt-2.5 border-t border-line pt-2.5">
          <div className="flex items-end gap-1.5" aria-hidden="true">
            {[6, 10, 16].map((r) => (
              <span key={r} className="rounded-full border border-ink-faint" style={{ width: r, height: r }} />
            ))}
          </div>
          <p className="mt-1.5 text-ink-muted">Marker size: {metricLabel.toLowerCase()}</p>
        </div>
      )}
    </div>
  );
}
