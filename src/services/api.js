import { mockWorldwideStats, mockCountries, mockHistoricalData } from './mockData';

const BASE_URL = 'https://disease.sh/v3/covid-19';

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 6000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchGlobalStats() {
  try {
    const data = await fetchWithTimeout(`${BASE_URL}/all`);
    return { data, source: 'live' };
  } catch (err) {
    console.warn('Using fallback global stats:', err.message);
    return { data: mockWorldwideStats, source: 'fallback' };
  }
}

export async function fetchCountries() {
  try {
    const data = await fetchWithTimeout(`${BASE_URL}/countries?sort=cases`);
    return { data, source: 'live' };
  } catch (err) {
    console.warn('Using fallback country data:', err.message);
    return { data: mockCountries, source: 'fallback' };
  }
}

export async function fetchCountryStats(countryCode) {
  if (!countryCode || countryCode === 'worldwide') {
    return fetchGlobalStats();
  }
  try {
    const data = await fetchWithTimeout(`${BASE_URL}/countries/${countryCode}?strict=true`);
    return { data, source: 'live' };
  } catch (err) {
    console.warn(`Using fallback for ${countryCode}:`, err.message);
    const country = mockCountries.find(
      (c) =>
        c.country.toLowerCase() === countryCode.toLowerCase() ||
        c.countryInfo.iso2?.toLowerCase() === countryCode.toLowerCase()
    );
    return { data: country || mockWorldwideStats, source: 'fallback' };
  }
}

export async function fetchHistoricalData(countryCode = 'all', days = 60) {
  try {
    const endpoint =
      countryCode === 'all' || countryCode === 'worldwide'
        ? `${BASE_URL}/historical/all?lastdays=${days}`
        : `${BASE_URL}/historical/${countryCode}?lastdays=${days}`;
    const raw = await fetchWithTimeout(endpoint);
    const timeline = raw.timeline ? raw.timeline : raw;
    return { data: timeline, source: 'live' };
  } catch (err) {
    console.warn('Using fallback historical stats:', err.message);
    return { data: mockHistoricalData, source: 'fallback' };
  }
}
