// Pure aggregation helpers over the outbreak records. No React in here.

import { COUNTRY_BY_CODE } from '../data/countries.js';
import { DISEASE_BY_ID } from '../data/diseases.js';
import { formatDay, formatMonth } from './format.js';
import { rollupRiskScore, toRisk } from './risk.js';

export const PERIODS = [
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '6 months' },
  { value: 365, label: '12 months' },
];

export const GRANULARITIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const pctChange = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0);

export function sumRange(arr, from, to) {
  let s = 0;
  for (let i = Math.max(0, from); i < Math.min(arr.length, to); i += 1) s += arr[i];
  return s;
}

const trendFrom = (last14, prev14) => {
  const change = pctChange(last14, prev14);
  return change > 10 ? 'rising' : change < -10 ? 'falling' : 'stable';
};

/* ------------------------------------------------------------------ */
/* Filtering                                                           */
/* ------------------------------------------------------------------ */

export function filterOutbreaks(outbreaks, { diseaseId = 'all', region = 'all', countryCode = 'all', risk = 'all' } = {}) {
  return outbreaks.filter((o) => {
    if (diseaseId !== 'all' && o.diseaseId !== diseaseId) return false;
    if (countryCode !== 'all' && o.countryCode !== Number(countryCode)) return false;
    if (region !== 'all' && COUNTRY_BY_CODE[o.countryCode]?.region !== region) return false;
    if (risk !== 'all' && o.risk.level !== risk) return false;
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* Global summary and metric cards                                     */
/* ------------------------------------------------------------------ */

function activeAt(outbreaks, offset) {
  const outs = new Set();
  const countries = new Set();
  for (const o of outbreaks) {
    const N = o.daily.length;
    if (sumRange(o.daily, N - offset - 14, N - offset) > 0) {
      outs.add(o.id);
      countries.add(o.countryCode);
    }
  }
  return { outbreaks: outs.size, countries: countries.size };
}

export function summarize(outbreaks) {
  const active = outbreaks.filter((o) => o.status === 'Active');
  const countries = new Set(active.map((o) => o.countryCode));
  const then = activeAt(outbreaks, 30);
  const total = (key) => outbreaks.reduce((s, o) => s + o[key], 0);
  const last30 = total('last30');
  const prev30 = total('prev30');
  const deaths30 = outbreaks.reduce((s, o) => s + sumRange(o.dailyDeaths, o.dailyDeaths.length - 30, o.dailyDeaths.length), 0);
  const prevDeaths30 = outbreaks.reduce(
    (s, o) => s + sumRange(o.dailyDeaths, o.dailyDeaths.length - 60, o.dailyDeaths.length - 30),
    0,
  );
  return {
    totalOutbreaks: outbreaks.length,
    activeOutbreaks: active.length,
    activeOutbreaksThen: then.outbreaks,
    countriesAffected: countries.size,
    countriesAffectedThen: then.countries,
    cases: total('cases'),
    deaths: total('deaths'),
    recovered: total('recovered'),
    activeCases: total('active'),
    last30,
    prev30,
    casesChangePct: pctChange(last30, prev30),
    deaths30,
    prevDeaths30,
    deathsChangePct: pctChange(deaths30, prevDeaths30),
    criticalOutbreaks: outbreaks.filter((o) => o.risk.level === 'critical' && o.status === 'Active').length,
  };
}

function dailyTotals(outbreaks, field, days) {
  const N = outbreaks[0]?.daily.length ?? 0;
  const out = new Array(Math.min(days, N)).fill(0);
  for (const o of outbreaks) {
    const arr = o[field];
    for (let i = 0; i < out.length; i += 1) out[i] += arr[N - out.length + i];
  }
  return out;
}

const severityFromDelta = (pct) => (pct >= 20 ? 'critical' : pct >= 5 ? 'high' : pct > -5 ? 'moderate' : 'low');

export function buildMetricCards(outbreaks, monitoredCountries) {
  const s = summarize(outbreaks);
  const activeSeries = [];
  const countrySeries = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const a = activeAt(outbreaks, offset);
    activeSeries.push(a.outbreaks);
    countrySeries.push(a.countries);
  }
  const outbreakDelta = pctChange(s.activeOutbreaks, s.activeOutbreaksThen);
  const countryDelta = pctChange(s.countriesAffected, s.countriesAffectedThen);
  return [
    {
      id: 'outbreaks',
      label: 'Active outbreaks',
      value: s.activeOutbreaks,
      detail: `${s.criticalOutbreaks} at critical level`,
      delta: { abs: s.activeOutbreaks - s.activeOutbreaksThen, pct: outbreakDelta, label: 'vs 30 days ago', unit: 'outbreaks' },
      series: activeSeries,
      severity: severityFromDelta(outbreakDelta),
    },
    {
      id: 'countries',
      label: 'Countries affected',
      value: s.countriesAffected,
      detail: `of ${monitoredCountries} monitored`,
      delta: { abs: s.countriesAffected - s.countriesAffectedThen, pct: countryDelta, label: 'vs 30 days ago', unit: 'countries' },
      series: countrySeries,
      severity: severityFromDelta(countryDelta),
    },
    {
      id: 'cases',
      label: 'Reported cases',
      value: s.cases,
      detail: `${s.last30.toLocaleString('en-US')} in the last 30 days`,
      delta: { abs: s.last30 - s.prev30, pct: s.casesChangePct, label: '30 days vs prior 30', unit: 'cases' },
      series: dailyTotals(outbreaks, 'daily', 30),
      severity: severityFromDelta(s.casesChangePct),
    },
    {
      id: 'deaths',
      label: 'Reported fatalities',
      value: s.deaths,
      detail: `${s.deaths30.toLocaleString('en-US')} in the last 30 days`,
      delta: { abs: s.deaths30 - s.prevDeaths30, pct: s.deathsChangePct, label: '30 days vs prior 30', unit: 'deaths' },
      series: dailyTotals(outbreaks, 'dailyDeaths', 30),
      severity: severityFromDelta(s.deathsChangePct),
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Time series                                                         */
/* ------------------------------------------------------------------ */

export function weeklySpark(outbreaks, weeks = 12) {
  const N = outbreaks[0]?.daily.length ?? 0;
  const out = [];
  for (let w = weeks - 1; w >= 0; w -= 1) {
    const to = N - w * 7;
    const from = to - 7;
    out.push(outbreaks.reduce((s, o) => s + sumRange(o.daily, from, to), 0));
  }
  return out;
}

const groupKeyFns = {
  total: () => 'total',
  disease: (o) => o.diseaseId,
  region: (o) => COUNTRY_BY_CODE[o.countryCode].region,
  country: (o) => String(o.countryCode),
};

/**
 * Bucket outbreak series into rows for a chart.
 * @returns {{rows: object[], keys: string[]}}
 */
export function aggregateSeries(outbreaks, dates, { days = 90, granularity = 'daily', metric = 'cases', groupBy = 'total' } = {}) {
  const N = dates.length;
  const start = Math.max(0, N - days);
  const field = metric === 'deaths' ? 'dailyDeaths' : 'daily';
  const keyFn = groupKeyFns[groupBy] ?? groupKeyFns.total;

  const bucketOf = new Array(N).fill(-1);
  const buckets = [];
  let lastMonth = null;
  for (let i = start; i < N; i += 1) {
    let idx;
    if (granularity === 'weekly') {
      idx = Math.floor((i - start) / 7);
    } else if (granularity === 'monthly') {
      const month = dates[i].slice(0, 7);
      if (month !== lastMonth) {
        buckets.push(null);
        lastMonth = month;
      }
      idx = buckets.length - 1;
    } else {
      idx = i - start;
    }
    if (!buckets[idx]) {
      buckets[idx] = {
        date: dates[i],
        label: granularity === 'monthly' ? formatMonth(dates[i]) : formatDay(dates[i]),
        total: 0,
      };
    }
    bucketOf[i] = idx;
  }

  const keyTotals = {};
  for (const o of outbreaks) {
    const key = keyFn(o);
    const arr = o[field];
    for (let i = start; i < N; i += 1) {
      const row = buckets[bucketOf[i]];
      row[key] = (row[key] ?? 0) + arr[i];
      row.total += arr[i];
      keyTotals[key] = (keyTotals[key] ?? 0) + arr[i];
    }
  }
  const keys = Object.keys(keyTotals).sort((a, b) => keyTotals[b] - keyTotals[a]);
  for (const row of buckets) for (const key of keys) row[key] = row[key] ?? 0;
  return { rows: buckets, keys };
}

/* ------------------------------------------------------------------ */
/* Breakdowns                                                          */
/* ------------------------------------------------------------------ */

/**
 * Group outbreaks by an arbitrary key and total the last `days` days, with the
 * preceding window of equal length for comparison when the series is long enough.
 */
export function breakdown(outbreaks, keyFn, { days = 365 } = {}) {
  const map = new Map();
  for (const o of outbreaks) {
    const N = o.daily.length;
    const key = keyFn(o);
    const entry = map.get(key) ?? { key, cases: 0, deaths: 0, previous: 0, outbreaks: 0, countries: new Set(), hasPrevious: 2 * days <= N };
    entry.cases += sumRange(o.daily, N - days, N);
    entry.deaths += sumRange(o.dailyDeaths, N - days, N);
    if (entry.hasPrevious) entry.previous += sumRange(o.daily, N - 2 * days, N - days);
    if (o.status === 'Active') entry.outbreaks += 1;
    entry.countries.add(o.countryCode);
    map.set(key, entry);
  }
  return [...map.values()]
    .map(({ countries, ...rest }) => ({
      ...rest,
      countries: countries.size,
      changePct: rest.hasPrevious ? pctChange(rest.cases, rest.previous) : null,
    }))
    .sort((a, b) => b.cases - a.cases);
}

/* ------------------------------------------------------------------ */
/* Country rows                                                        */
/* ------------------------------------------------------------------ */

export function buildCountryRows(outbreaks) {
  const byCountry = new Map();
  for (const o of outbreaks) {
    if (!byCountry.has(o.countryCode)) byCountry.set(o.countryCode, []);
    byCountry.get(o.countryCode).push(o);
  }
  const rows = [];
  for (const [code, list] of byCountry) {
    const country = COUNTRY_BY_CODE[code];
    const active = list.filter((o) => o.status === 'Active');
    const sum = (key) => list.reduce((s, o) => s + o[key], 0);
    const last30 = sum('last30');
    const prev30 = sum('prev30');
    const risk = toRisk(rollupRiskScore(active.map((o) => o.risk.score), active.length));
    rows.push({
      code,
      iso: country.iso,
      name: country.name,
      region: country.region,
      population: country.pop,
      outbreaks: list,
      diseaseIds: [...new Set(list.map((o) => o.diseaseId))],
      activeOutbreaks: active.length,
      cases: sum('cases'),
      deaths: sum('deaths'),
      recovered: sum('recovered'),
      active: sum('active'),
      last30,
      prev30,
      changePct: pctChange(last30, prev30),
      trend: trendFrom(sum('last14'), sum('prev14')),
      risk,
      lastReported: list.reduce((m, o) => (o.lastReported > m ? o.lastReported : m), ''),
      spark: weeklySpark(list),
    });
  }
  return rows.sort((a, b) => b.risk.score - a.risk.score || b.cases - a.cases);
}

export function buildDiseaseRows(outbreaks) {
  const rows = [];
  for (const [id, disease] of Object.entries(DISEASE_BY_ID)) {
    const list = outbreaks.filter((o) => o.diseaseId === id);
    if (!list.length) continue;
    const active = list.filter((o) => o.status === 'Active');
    const sum = (key) => list.reduce((s, o) => s + o[key], 0);
    const countries = new Set(list.map((o) => o.countryCode));
    const last30 = sum('last30');
    const prev30 = sum('prev30');
    rows.push({
      id,
      disease,
      outbreaks: list,
      activeOutbreaks: active.length,
      countries: countries.size,
      regions: [...new Set([...countries].map((c) => COUNTRY_BY_CODE[c].region))],
      cases: sum('cases'),
      deaths: sum('deaths'),
      last30,
      prev30,
      changePct: pctChange(last30, prev30),
      trend: trendFrom(sum('last14'), sum('prev14')),
      risk: toRisk(rollupRiskScore(active.map((o) => o.risk.score), countries.size / 3)),
      spark: weeklySpark(list, 16),
    });
  }
  return rows.sort((a, b) => b.risk.score - a.risk.score || b.cases - a.cases);
}

export const countryOptions = (rows) =>
  [...rows].sort((a, b) => a.name.localeCompare(b.name)).map((r) => ({ value: String(r.code), label: r.name }));

