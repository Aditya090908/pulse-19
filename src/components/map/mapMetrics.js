export const MAP_METRICS = [
  { value: 'cases', label: 'Cumulative cases', short: 'Reported cases (12 months)', get: (r) => r.cases },
  { value: 'last30', label: 'Last 30 days', short: 'Cases in the last 30 days', get: (r) => r.last30 },
  { value: 'deaths', label: 'Fatalities', short: 'Reported fatalities (12 months)', get: (r) => r.deaths },
];

export const getMapMetric = (value) => MAP_METRICS.find((m) => m.value === value) ?? MAP_METRICS[0];
