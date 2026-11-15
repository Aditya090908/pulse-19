// Derives the local alert feed from the simulated outbreak data, so every alert agrees with the dashboard.
// Alerts are demonstration bulletins: nothing here is sent by a real surveillance agency.

import { COUNTRY_BY_CODE } from '../data/countries.js';
import { DISEASE_BY_ID } from '../data/diseases.js';
import { formatDate, formatInt, formatPercent } from './format.js';
import { hashString, mulberry32 } from './random.js';
import { buildCountryRows } from './aggregate.js';
import { RISK_LEVELS, outbreakRiskScore, riskLevelFromScore, riskRank, rollupRiskScore } from './risk.js';

export const ALERT_TYPES = {
  critical_outbreak: { label: 'Critical outbreak', icon: 'ShieldAlert' },
  case_surge: { label: 'Case increase', icon: 'TrendingUp' },
  new_outbreak: { label: 'New regional outbreak', icon: 'MapPin' },
  risk_change: { label: 'Risk level change', icon: 'Gauge' },
  reporting_update: { label: 'Reporting update', icon: 'FileClock' },
};

const HOUR = 3600 * 1000;

export function buildAlerts(snapshot) {
  const refMs = new Date(snapshot.meta.referenceTimestamp).getTime();
  const alerts = [];
  const at = (id, minHours, spanHours) => {
    const rng = mulberry32(hashString(id));
    return new Date(refMs - (minHours + rng() * spanHours) * HOUR).toISOString();
  };
  const { outbreaks } = snapshot;
  const nameOf = (o) => COUNTRY_BY_CODE[o.countryCode].name;
  const diseaseOf = (o) => DISEASE_BY_ID[o.diseaseId];

  // Critical outbreak alerts
  outbreaks
    .filter((o) => o.risk.level === 'critical' && o.status === 'Active')
    .sort((a, b) => b.risk.score - a.risk.score)
    .slice(0, 10)
    .forEach((o) => {
      const id = `critical_outbreak:${o.id}`;
      alerts.push({
        id,
        type: 'critical_outbreak',
        severity: 'critical',
        title: `${diseaseOf(o).short} outbreak at critical level in ${nameOf(o)}`,
        body: `${formatInt(o.last30)} cases reported in the last 30 days (${formatPercent(o.changePct)} vs the prior 30 days). Fatality ratio to date: ${((o.deaths / Math.max(1, o.cases)) * 100).toFixed(1)}%.`,
        countryCode: o.countryCode,
        diseaseId: o.diseaseId,
        timestamp: at(id, 2, 70),
      });
    });

  // Significant increases in reported cases
  outbreaks
    .filter((o) => o.changePct >= 35 && o.last30 >= 150 && o.risk.level !== 'critical' && o.status === 'Active')
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 10)
    .forEach((o) => {
      const id = `case_surge:${o.id}`;
      alerts.push({
        id,
        type: 'case_surge',
        severity: o.risk.level === 'low' ? 'moderate' : o.risk.level,
        title: `${diseaseOf(o).short} cases up ${formatPercent(o.changePct, { sign: false })} in ${nameOf(o)}`,
        body: `${formatInt(o.last30)} cases in the last 30 days against ${formatInt(o.prev30)} in the 30 days before.`,
        countryCode: o.countryCode,
        diseaseId: o.diseaseId,
        timestamp: at(id, 8, 120),
      });
    });

  // New regional outbreak notifications: the most recently first-reported outbreaks
  [...outbreaks]
    .filter((o) => o.firstReported)
    .sort((a, b) => (a.firstReported < b.firstReported ? 1 : -1))
    .slice(0, 6)
    .forEach((o) => {
      const id = `new_outbreak:${o.id}`;
      alerts.push({
        id,
        type: 'new_outbreak',
        severity: o.risk.level === 'critical' ? 'high' : o.risk.level === 'low' ? 'moderate' : o.risk.level,
        title: `${diseaseOf(o).short} outbreak notified in ${nameOf(o)}`,
        body: `First case in this dataset reported ${formatDate(o.firstReported)} in the ${COUNTRY_BY_CODE[o.countryCode].region} region. ${formatInt(o.cases)} cases to date.`,
        countryCode: o.countryCode,
        diseaseId: o.diseaseId,
        timestamp: at(id, 20, 220),
      });
    });

  // Country-level risk changes: compare today's level with the level implied by the prior 30 days
  const riskChanges = [];
  buildCountryRows(outbreaks).forEach((row) => {
    const active = row.outbreaks.filter((o) => o.status === 'Active');
    const before = rollupRiskScore(
      active.map((o) => outbreakRiskScore({ last30: o.prev30, changePct: 0, cfr: DISEASE_BY_ID[o.diseaseId].cfr })),
      active.length,
    );
    const beforeLevel = riskLevelFromScore(before);
    if (beforeLevel === row.risk.level) return;
    const raised = riskRank(row.risk.level) > riskRank(beforeLevel);
    const id = `risk_change:${row.code}`;
    riskChanges.push({
      id,
      type: 'risk_change',
      severity: raised ? row.risk.level : 'low',
      title: `${row.name} risk level ${raised ? 'raised' : 'lowered'} to ${RISK_LEVELS[row.risk.level].label}`,
      body: `Overall risk moved from ${RISK_LEVELS[beforeLevel].label} to ${RISK_LEVELS[row.risk.level].label} (score ${row.risk.score}/100) across ${row.activeOutbreaks} active outbreaks.`,
      countryCode: row.code,
      diseaseId: null,
      timestamp: at(id, 12, 150),
      raised,
      score: row.risk.score,
    });
  });
  riskChanges
    .sort((a, b) => Number(b.raised) - Number(a.raised) || b.score - a.score)
    .slice(0, 8)
    .forEach(({ raised, score, ...alert }) => alerts.push(alert));

  // Reporting updates: delayed reports
  outbreaks
    .filter((o) => o.reportingLag >= 3)
    .sort((a, b) => b.reportingLag - a.reportingLag)
    .slice(0, 6)
    .forEach((o) => {
      const id = `reporting_update:${o.id}`;
      alerts.push({
        id,
        type: 'reporting_update',
        severity: 'low',
        title: `Reporting delay for ${diseaseOf(o).short} in ${nameOf(o)}`,
        body: `The latest report is ${o.reportingLag} days old (last reported ${formatDate(o.lastReported)}). Recent trend estimates may be understated.`,
        countryCode: o.countryCode,
        diseaseId: o.diseaseId,
        timestamp: at(id, 6, 90),
      });
    });

  return alerts.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}
