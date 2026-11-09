/**
 * PULSE 19 - Zero-API Local Data Service
 * Loads strictly from local JSON datasets
 */

import globalStats from '../data/global-stats.json';
import countries from '../data/countries.json';
import historicalStats from '../data/historical-stats.json';
import alerts from '../data/alerts.json';

export function getGlobalStats() {
  return { ...globalStats };
}

export function getCountries() {
  return [...countries];
}

export function getCountryByCode(code) {
  if (!code || code === 'worldwide') {
    return null;
  }
  const q = String(code).toLowerCase();
  return (
    countries.find(
      (c) =>
        c.country.toLowerCase() === q ||
        (c.iso2 && c.iso2.toLowerCase() === q) ||
        (c.iso3 && c.iso3.toLowerCase() === q)
    ) || null
  );
}

export function getHistoricalData(timeframe = '30d') {
  const tf = timeframe.toLowerCase();
  const dataset = historicalStats.worldwide[tf] || historicalStats.worldwide['30d'];

  return {
    reference: historicalStats.reference,
    referenceDate: historicalStats.referenceDate,
    timeline: dataset,
  };
}

export function getAlerts() {
  return [...alerts];
}
