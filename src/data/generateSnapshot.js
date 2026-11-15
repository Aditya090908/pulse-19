// Builds the simulated demonstration dataset.
// Everything here is generated from a seeded random number generator: the numbers are
// invented, reproducible and never fetched from a real surveillance source.

import { COUNTRIES } from './countries.js';
import { DISEASE_BY_ID } from './diseases.js';
import { getSeedFor } from './outbreakSeed.js';
import { hashString, mulberry32 } from '../utils/random.js';
import { outbreakRiskScore, toRisk } from '../utils/risk.js';

export const SERIES_DAYS = 365;
const DAY_MS = 86400000;

const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10);
const sum = (arr, from, to) => {
  let s = 0;
  for (let i = Math.max(0, from); i < Math.min(arr.length, to); i += 1) s += arr[i];
  return s;
};
const pct = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0);
const logistic = (x) => 1 / (1 + Math.exp(-x));

function buildOutbreak(country, { diseaseId, scale, phase }, dates) {
  const disease = DISEASE_BY_ID[diseaseId];
  const rng = mulberry32(hashString(`${country.iso}-${diseaseId}`));
  const N = dates.length;
  const last = N - 1;

  const amp = 3 * 2 ** scale * disease.rate * (0.8 + rng() * 0.5);
  const width = 28 + rng() * 30;
  const wobble = rng() * Math.PI * 2;

  let peak;
  if (phase === 'rising') peak = last + 18 + rng() * 25;
  else if (phase === 'peak') peak = last - (3 + rng() * 8);
  else if (phase === 'falling') peak = last - (55 + rng() * 70);
  else peak = N / 2;
  const onset = phase === 'stable' ? last - (120 + rng() * 230) : peak - 3 * width;

  const daily = new Array(N);
  const dailyDeaths = new Array(N);
  for (let i = 0; i < N; i += 1) {
    const ramp = logistic((i - onset) / 4);
    let v;
    if (phase === 'stable') {
      v = amp * 0.32 * (1 + 0.18 * Math.sin(i / 14 + wobble)) * ramp;
    } else {
      v = amp * Math.exp(-((i - peak) ** 2) / (2 * width ** 2)) * ramp;
    }
    v *= 0.85 + rng() * 0.3;
    const weekday = new Date(`${dates[i]}T00:00:00Z`).getUTCDay();
    if (weekday === 0 || weekday === 6) v *= 0.88;
    daily[i] = Math.round(v);
  }
  for (let i = 0; i < N; i += 1) {
    const expected = daily[Math.max(0, i - 6)] * disease.cfr * (0.7 + rng() * 0.6);
    dailyDeaths[i] = Math.floor(expected + rng());
  }

  const cases = sum(daily, 0, N);
  const deaths = sum(dailyDeaths, 0, N);
  const last7 = sum(daily, N - 7, N);
  const last14 = sum(daily, N - 14, N);
  const prev14 = sum(daily, N - 28, N - 14);
  const last30 = sum(daily, N - 30, N);
  const prev30 = sum(daily, N - 60, N - 30);
  const changePct = pct(last30, prev30);
  const change14 = pct(last14, prev14);
  const trend = change14 > 10 ? 'rising' : change14 < -10 ? 'falling' : 'stable';
  const active = Math.max(0, sum(daily, N - 21, N) - sum(dailyDeaths, N - 21, N));
  const recovered = Math.max(0, cases - deaths - active);
  const reportingLag = Math.floor(rng() * rng() * 7);
  const firstIdx = daily.findIndex((v) => v >= 1);

  let peakIdx = 0;
  for (let i = 1; i < N; i += 1) if (daily[i] > daily[peakIdx]) peakIdx = i;

  return {
    id: `${country.iso}-${diseaseId}`,
    countryCode: country.code,
    diseaseId,
    status: last14 === 0 ? 'Contained' : 'Active',
    cases,
    deaths,
    recovered,
    active,
    last7,
    last14,
    prev14,
    last30,
    prev30,
    changePct,
    trend,
    risk: toRisk(outbreakRiskScore({ last30, changePct, cfr: disease.cfr })),
    firstReported: firstIdx >= 0 ? dates[firstIdx] : null,
    lastReported: dates[last - reportingLag],
    reportingLag,
    peakDate: dates[peakIdx],
    peakValue: daily[peakIdx],
    daily,
    dailyDeaths,
  };
}

/**
 * @param {{referenceDate?: Date}} options
 */
export function generateSnapshot({ referenceDate = new Date() } = {}) {
  const refDayMs = Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate());
  const dates = Array.from({ length: SERIES_DAYS }, (_, i) => isoDay(refDayMs - (SERIES_DAYS - 1 - i) * DAY_MS));

  const outbreaks = [];
  for (const country of COUNTRIES) {
    for (const entry of getSeedFor(country.code)) {
      outbreaks.push(buildOutbreak(country, entry, dates));
    }
  }

  return {
    meta: {
      simulated: true,
      label: 'Simulated demonstration dataset',
      generator: 'seeded-v1',
      referenceDate: dates[dates.length - 1],
      referenceTimestamp: referenceDate.toISOString(),
      monitoredCountries: COUNTRIES.length,
      outbreakCount: outbreaks.length,
    },
    dates,
    outbreaks,
  };
}
