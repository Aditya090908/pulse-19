// Derived indicators and a rules-based plain-language summary for a country.
// The summary is generated from the simulated numbers; it is not written by an analyst.

import { DISEASE_BY_ID } from '../data/diseases.js';
import { formatCompact, formatDate, formatInt, formatPercent } from './format.js';
import { sumRange } from './aggregate.js';
import { RISK_LEVELS } from './risk.js';

export function countryIndicators(row, dates) {
  const N = dates.length;
  const daily = new Array(N).fill(0);
  for (const o of row.outbreaks) for (let i = 0; i < N; i += 1) daily[i] += o.daily[i];
  let peakIdx = 0;
  for (let i = 1; i < N; i += 1) if (daily[i] > daily[peakIdx]) peakIdx = i;

  const cfr = row.cases ? (row.deaths / row.cases) * 100 : 0;
  const recovery = row.cases ? (row.recovered / row.cases) * 100 : 0;
  const per100k = row.population ? (row.last30 / (row.population * 10)) : 0; // pop is in millions -> per 100k = cases / (pop*10)
  const avg7 = sumRange(daily, N - 7, N) / 7;
  const lag = Math.max(...row.outbreaks.map((o) => o.reportingLag));

  return [
    { label: 'Case fatality ratio', value: `${cfr.toFixed(2)}%`, hint: 'Fatalities as a share of reported cases' },
    { label: 'Recovery rate', value: `${recovery.toFixed(1)}%`, hint: 'Recovered as a share of reported cases' },
    { label: 'Cases per 100,000 (30 d)', value: per100k >= 10 ? per100k.toFixed(0) : per100k.toFixed(1), hint: 'Last 30 days, using approximate population' },
    { label: '7-day average', value: `${formatInt(avg7)} / day`, hint: 'Mean new cases per day, last 7 days' },
    { label: 'Peak day', value: formatDate(dates[peakIdx]), hint: `${formatInt(daily[peakIdx])} cases reported that day` },
    { label: 'Reporting lag', value: lag === 0 ? 'Up to date' : `${lag} day${lag === 1 ? '' : 's'}`, hint: 'Age of the oldest latest-report across outbreaks' },
  ];
}

export function regionContext(row, allRows) {
  const peers = allRows.filter((r) => r.region === row.region).sort((a, b) => b.last30 - a.last30);
  const rank = peers.findIndex((r) => r.code === row.code) + 1;
  const regionTotal = peers.reduce((s, r) => s + r.last30, 0);
  return { rank, of: peers.length, share: regionTotal ? (row.last30 / regionTotal) * 100 : 0, region: row.region };
}

export function countrySummary(row) {
  const active = row.outbreaks.filter((o) => o.status === 'Active');
  if (!active.length) {
    return `${row.name} has no active outbreaks in this dataset. All tracked outbreaks are marked as contained.`;
  }
  const byLast30 = [...active].sort((a, b) => b.last30 - a.last30);
  const lead = byLast30[0];
  const leadName = DISEASE_BY_ID[lead.diseaseId].name;
  const share = row.last30 ? Math.round((lead.last30 / row.last30) * 100) : 0;
  const parts = [
    `${row.name} is rated ${RISK_LEVELS[row.risk.level].label.toLowerCase()} risk with ${active.length} active ${active.length === 1 ? 'outbreak' : 'outbreaks'}.`,
    `${leadName} drives ${share}% of the ${formatCompact(row.last30)} cases reported in the last 30 days (${formatPercent(lead.changePct)} against the prior 30 days).`,
  ];
  const rising = active.filter((o) => o.trend === 'rising' && o.id !== lead.id);
  if (rising.length) {
    parts.push(`Cases are also rising for ${rising.map((o) => DISEASE_BY_ID[o.diseaseId].short).join(', ')}.`);
  }
  const deadliest = [...active].sort((a, b) => DISEASE_BY_ID[b.diseaseId].cfr - DISEASE_BY_ID[a.diseaseId].cfr)[0];
  if (DISEASE_BY_ID[deadliest.diseaseId].cfr >= 0.1) {
    parts.push(`${DISEASE_BY_ID[deadliest.diseaseId].short} carries a high fatality ratio, so even small case counts matter.`);
  }
  return parts.join(' ');
}
