// One consistent severity classification used by the map, tables, alerts and charts.

export const RISK_KEYS = ['critical', 'high', 'moderate', 'low'];

export const RISK_LEVELS = {
  critical: {
    key: 'critical',
    label: 'Critical',
    rank: 3,
    badge: 'border-danger/40 bg-danger/15 text-danger',
    dot: 'bg-danger',
    text: 'text-danger',
    description: 'Rapid spread, high burden or high fatality ratio',
  },
  high: {
    key: 'high',
    label: 'High',
    rank: 2,
    badge: 'border-warn/40 bg-warn/15 text-warn',
    dot: 'bg-warn',
    text: 'text-warn',
    description: 'Large or growing outbreak that needs close monitoring',
  },
  moderate: {
    key: 'moderate',
    label: 'Moderate',
    rank: 1,
    badge: 'border-caution/40 bg-caution/15 text-caution',
    dot: 'bg-caution',
    text: 'text-caution',
    description: 'Sustained transmission at a limited scale',
  },
  low: {
    key: 'low',
    label: 'Low',
    rank: 0,
    badge: 'border-line-strong bg-panel-3 text-ink-muted',
    dot: 'bg-ink-faint',
    text: 'text-ink-muted',
    description: 'Small, stable or declining activity',
  },
};

export const riskRank = (level) => RISK_LEVELS[level]?.rank ?? 0;

export function riskLevelFromScore(score) {
  if (score >= 84) return 'critical';
  if (score >= 62) return 'high';
  if (score >= 38) return 'moderate';
  return 'low';
}

/**
 * Outbreak risk score (0-100) from recent burden, momentum and lethality.
 * This is a transparent heuristic for the demo, not a validated epidemiological model.
 */
export function outbreakRiskScore({ last30, changePct, cfr }) {
  const burden = 17 * Math.log10(last30 + 1);
  const momentum = 0.2 * Math.min(100, Math.max(-50, changePct));
  const lethality = Math.min(25, cfr * 60);
  return Math.min(100, Math.max(0, burden + momentum + lethality));
}

/** Roll several outbreak scores into one score for a country, disease or region. */
export function rollupRiskScore(scores, count = scores.length) {
  if (!scores.length) return 0;
  return Math.min(100, Math.max(...scores) + Math.min(4, Math.max(0, count - 1) * 1.5));
}

export function toRisk(score) {
  return { score: Math.round(score), level: riskLevelFromScore(score) };
}

/** Colours for charts and the map (hex, because Leaflet and Recharts need literals). */
export const RISK_COLORS = {
  dark: { critical: '#ef4444', high: '#fb923c', moderate: '#facc15', low: '#94a3b8' },
  light: { critical: '#b91c1c', high: '#c2410c', moderate: '#a16207', low: '#64748b' },
};
