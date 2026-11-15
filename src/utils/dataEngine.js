/**
 * PULSE 19 - Local Data Engine & Analytics Utilities
 * Single Source of Truth Calculation Engine
 */

export function calculateActiveCases(cases = 0, recovered = 0, deaths = 0) {
  const active = (cases || 0) - (recovered || 0) - (deaths || 0);
  return Math.max(0, active);
}

export function calculateRecoveryPercentage(recovered = 0, cases = 0) {
  if (!cases || cases <= 0) return 0;
  return Number(((recovered / cases) * 100).toFixed(2));
}

export function calculateMortalityPercentage(deaths = 0, cases = 0) {
  if (!cases || cases <= 0) return 0;
  return Number(((deaths / cases) * 100).toFixed(2));
}

export function calculateCasesPerMillion(cases = 0, population = 0) {
  if (!population || population <= 0) return 0;
  return Math.round((cases / population) * 1_000_000);
}

export function calculateDeathsPerMillion(deaths = 0, population = 0) {
  if (!population || population <= 0) return 0;
  return Math.round((deaths / population) * 1_000_000);
}

/**
 * Sorts country array by specified property & direction
 */
export function sortCountries(countries = [], sortBy = 'cases', direction = 'desc') {
  const clone = [...countries];
  const mult = direction === 'asc' ? 1 : -1;

  return clone.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    // Computed sorts
    if (sortBy === 'recoveryRate') {
      valA = calculateRecoveryPercentage(a.recovered, a.cases);
      valB = calculateRecoveryPercentage(b.recovered, b.cases);
    } else if (sortBy === 'mortalityRate') {
      valA = calculateMortalityPercentage(a.deaths, a.cases);
      valB = calculateMortalityPercentage(b.deaths, b.cases);
    } else if (sortBy === 'country') {
      return mult * (a.country || '').localeCompare(b.country || '');
    }

    if (valA === undefined || valA === null) valA = 0;
    if (valB === undefined || valB === null) valB = 0;

    return (valB - valA) * (direction === 'desc' ? 1 : -1);
  });
}

/**
 * Filter countries by text search, continent, or preset filter
 */
export function filterCountries(countries = [], { search = '', filterType = 'all', continent = 'all' } = {}) {
  let result = [...countries];

  // Continent filter
  if (continent && continent !== 'all') {
    result = result.filter(c => (c.continent || '').toLowerCase() === continent.toLowerCase());
  }

  // Search filter (name, iso2, iso3)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(c =>
      c.country.toLowerCase().includes(q) ||
      (c.iso2 && c.iso2.toLowerCase().includes(q)) ||
      (c.iso3 && c.iso3.toLowerCase().includes(q))
    );
  }

  // Preset Filters
  if (filterType === 'top10') {
    result = sortCountries(result, 'cases', 'desc').slice(0, 10);
  } else if (filterType === 'high_recovery') {
    result = result.filter(c => calculateRecoveryPercentage(c.recovered, c.cases) >= 95);
  } else if (filterType === 'high_mortality') {
    result = result.filter(c => calculateMortalityPercentage(c.deaths, c.cases) >= 2.0);
  }

  return result;
}

/**
 * Generates ordinal rank mapping
 */
export function generateRankings(countries = [], metric = 'cases') {
  const sorted = sortCountries(countries, metric, 'desc');
  const rankMap = new Map();
  sorted.forEach((c, index) => {
    rankMap.set(c.id || c.country, index + 1);
  });
  return rankMap;
}

/**
 * Pure client-side CSV Export utility
 */
export function exportToCSV(countries = [], filename = 'pulse19_epidemiological_dataset.csv') {
  const headers = [
    'Rank',
    'Country',
    'ISO2',
    'ISO3',
    'Continent',
    'Population',
    'Total Cases',
    '24h Influx',
    'Active Cases',
    'Recovered',
    'Total Deaths',
    'Critical ICU',
    'Recovery Rate (%)',
    'Mortality Rate (%)',
    'Cases Per 1M'
  ];

  const sorted = sortCountries(countries, 'cases', 'desc');

  const rows = sorted.map((c, i) => [
    i + 1,
    `"${c.country}"`,
    c.iso2 || '',
    c.iso3 || '',
    `"${c.continent || ''}"`,
    c.population || 0,
    c.cases || 0,
    c.todayCases || 0,
    calculateActiveCases(c.cases, c.recovered, c.deaths),
    c.recovered || 0,
    c.deaths || 0,
    c.critical || 0,
    calculateRecoveryPercentage(c.recovered, c.cases),
    calculateMortalityPercentage(c.deaths, c.cases),
    calculateCasesPerMillion(c.cases, c.population)
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Client-side PDF Report Generator using Native Print Formatting
 */
export function triggerPrintReport() {
  window.print();
}
