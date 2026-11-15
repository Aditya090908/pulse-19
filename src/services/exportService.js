// CSV export and print helpers.

import { COUNTRY_BY_CODE } from '../data/countries.js';
import { DISEASE_BY_ID } from '../data/diseases.js';

const SOURCE_LABEL = 'SIMULATED DEMO DATA';

const escapeCell = (value) => {
  if (value == null) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function toCsv(rows, columns) {
  const header = [...columns.map((c) => c.label), 'data_source'];
  const lines = rows.map((row) => [...columns.map((c) => c.value(row)), SOURCE_LABEL].map(escapeCell).join(','));
  return [header.map(escapeCell).join(','), ...lines].join('\r\n');
}

export function downloadCsv(filename, rows, columns) {
  const blob = new Blob([`\uFEFF${toCsv(rows, columns)}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const COUNTRY_COLUMNS = [
  { label: 'country', value: (r) => r.name },
  { label: 'iso3', value: (r) => r.iso },
  { label: 'region', value: (r) => r.region },
  { label: 'active_outbreaks', value: (r) => r.activeOutbreaks },
  { label: 'diseases', value: (r) => r.diseaseIds.map((id) => DISEASE_BY_ID[id].name).join('; ') },
  { label: 'reported_cases_12m', value: (r) => r.cases },
  { label: 'fatalities_12m', value: (r) => r.deaths },
  { label: 'cases_last_30d', value: (r) => r.last30 },
  { label: 'change_vs_prior_30d_pct', value: (r) => r.changePct.toFixed(1) },
  { label: 'trend', value: (r) => r.trend },
  { label: 'risk_level', value: (r) => r.risk.level },
  { label: 'risk_score', value: (r) => r.risk.score },
  { label: 'last_reported', value: (r) => r.lastReported },
];

export const OUTBREAK_COLUMNS = [
  { label: 'country', value: (o) => COUNTRY_BY_CODE[o.countryCode].name },
  { label: 'region', value: (o) => COUNTRY_BY_CODE[o.countryCode].region },
  { label: 'disease', value: (o) => DISEASE_BY_ID[o.diseaseId].name },
  { label: 'status', value: (o) => o.status },
  { label: 'reported_cases_12m', value: (o) => o.cases },
  { label: 'fatalities_12m', value: (o) => o.deaths },
  { label: 'recovered', value: (o) => o.recovered },
  { label: 'active_cases', value: (o) => o.active },
  { label: 'cases_last_30d', value: (o) => o.last30 },
  { label: 'change_vs_prior_30d_pct', value: (o) => o.changePct.toFixed(1) },
  { label: 'trend', value: (o) => o.trend },
  { label: 'risk_level', value: (o) => o.risk.level },
  { label: 'first_reported', value: (o) => o.firstReported },
  { label: 'last_reported', value: (o) => o.lastReported },
];

export const ALERT_COLUMNS = [
  { label: 'timestamp', value: (a) => a.timestamp },
  { label: 'severity', value: (a) => a.severity },
  { label: 'type', value: (a) => a.type },
  { label: 'country', value: (a) => (a.countryCode ? COUNTRY_BY_CODE[a.countryCode].name : '') },
  { label: 'disease', value: (a) => (a.diseaseId ? DISEASE_BY_ID[a.diseaseId].name : '') },
  { label: 'title', value: (a) => a.title },
  { label: 'detail', value: (a) => a.body },
];

export function printReport() {
  window.print();
}
