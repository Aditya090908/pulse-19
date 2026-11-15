// Static reference data for the monitored territories.
// `code` is the ISO 3166-1 numeric code, which matches world-atlas feature ids.
// Coordinates are approximate marker positions; `pop` is approximate population in millions.
// This is reference data used to label the simulation, not verified surveillance data.

export const REGIONS = ['Africa', 'Americas', 'Asia-Pacific', 'Europe', 'Middle East'];

export const COUNTRIES = [
  // Americas
  { code: 840, iso: 'USA', name: 'United States', region: 'Americas', lat: 39.8, lng: -98.6, pop: 335 },
  { code: 124, iso: 'CAN', name: 'Canada', region: 'Americas', lat: 56.0, lng: -100.0, pop: 40 },
  { code: 484, iso: 'MEX', name: 'Mexico', region: 'Americas', lat: 23.6, lng: -102.5, pop: 129 },
  { code: 76, iso: 'BRA', name: 'Brazil', region: 'Americas', lat: -10.0, lng: -52.0, pop: 216 },
  { code: 32, iso: 'ARG', name: 'Argentina', region: 'Americas', lat: -34.0, lng: -64.0, pop: 46 },
  { code: 170, iso: 'COL', name: 'Colombia', region: 'Americas', lat: 4.5, lng: -73.0, pop: 52 },
  { code: 604, iso: 'PER', name: 'Peru', region: 'Americas', lat: -9.2, lng: -75.0, pop: 34 },
  // Europe
  { code: 826, iso: 'GBR', name: 'United Kingdom', region: 'Europe', lat: 54.0, lng: -2.0, pop: 68 },
  { code: 250, iso: 'FRA', name: 'France', region: 'Europe', lat: 46.6, lng: 2.4, pop: 68 },
  { code: 276, iso: 'DEU', name: 'Germany', region: 'Europe', lat: 51.0, lng: 10.0, pop: 84 },
  { code: 724, iso: 'ESP', name: 'Spain', region: 'Europe', lat: 40.0, lng: -3.7, pop: 48 },
  { code: 380, iso: 'ITA', name: 'Italy', region: 'Europe', lat: 42.8, lng: 12.5, pop: 59 },
  { code: 643, iso: 'RUS', name: 'Russia', region: 'Europe', lat: 58.0, lng: 60.0, pop: 144 },
  // Middle East
  { code: 792, iso: 'TUR', name: 'Türkiye', region: 'Middle East', lat: 39.0, lng: 35.0, pop: 85 },
  { code: 682, iso: 'SAU', name: 'Saudi Arabia', region: 'Middle East', lat: 24.0, lng: 45.0, pop: 37 },
  { code: 364, iso: 'IRN', name: 'Iran', region: 'Middle East', lat: 32.0, lng: 53.0, pop: 89 },
  { code: 887, iso: 'YEM', name: 'Yemen', region: 'Middle East', lat: 15.5, lng: 48.0, pop: 34 },
  // Africa
  { code: 818, iso: 'EGY', name: 'Egypt', region: 'Africa', lat: 26.8, lng: 30.8, pop: 112 },
  { code: 566, iso: 'NGA', name: 'Nigeria', region: 'Africa', lat: 9.0, lng: 8.0, pop: 224 },
  { code: 180, iso: 'COD', name: 'DR Congo', region: 'Africa', lat: -2.9, lng: 23.7, pop: 102 },
  { code: 231, iso: 'ETH', name: 'Ethiopia', region: 'Africa', lat: 9.0, lng: 40.0, pop: 126 },
  { code: 404, iso: 'KEN', name: 'Kenya', region: 'Africa', lat: 0.5, lng: 38.0, pop: 55 },
  { code: 710, iso: 'ZAF', name: 'South Africa', region: 'Africa', lat: -29.0, lng: 24.0, pop: 60 },
  { code: 800, iso: 'UGA', name: 'Uganda', region: 'Africa', lat: 1.3, lng: 32.3, pop: 49 },
  { code: 834, iso: 'TZA', name: 'Tanzania', region: 'Africa', lat: -6.3, lng: 34.8, pop: 67 },
  { code: 729, iso: 'SDN', name: 'Sudan', region: 'Africa', lat: 15.5, lng: 30.0, pop: 48 },
  { code: 288, iso: 'GHA', name: 'Ghana', region: 'Africa', lat: 7.9, lng: -1.2, pop: 34 },
  { code: 508, iso: 'MOZ', name: 'Mozambique', region: 'Africa', lat: -18.6, lng: 35.0, pop: 34 },
  { code: 450, iso: 'MDG', name: 'Madagascar', region: 'Africa', lat: -19.0, lng: 46.7, pop: 30 },
  // Asia-Pacific
  { code: 356, iso: 'IND', name: 'India', region: 'Asia-Pacific', lat: 22.0, lng: 79.0, pop: 1430 },
  { code: 586, iso: 'PAK', name: 'Pakistan', region: 'Asia-Pacific', lat: 30.0, lng: 70.0, pop: 240 },
  { code: 50, iso: 'BGD', name: 'Bangladesh', region: 'Asia-Pacific', lat: 23.7, lng: 90.3, pop: 173 },
  { code: 156, iso: 'CHN', name: 'China', region: 'Asia-Pacific', lat: 35.0, lng: 103.0, pop: 1410 },
  { code: 360, iso: 'IDN', name: 'Indonesia', region: 'Asia-Pacific', lat: -2.0, lng: 118.0, pop: 278 },
  { code: 608, iso: 'PHL', name: 'Philippines', region: 'Asia-Pacific', lat: 12.8, lng: 122.0, pop: 117 },
  { code: 704, iso: 'VNM', name: 'Vietnam', region: 'Asia-Pacific', lat: 16.0, lng: 107.8, pop: 99 },
  { code: 764, iso: 'THA', name: 'Thailand', region: 'Asia-Pacific', lat: 15.0, lng: 101.0, pop: 72 },
  { code: 392, iso: 'JPN', name: 'Japan', region: 'Asia-Pacific', lat: 36.5, lng: 138.0, pop: 124 },
  { code: 410, iso: 'KOR', name: 'South Korea', region: 'Asia-Pacific', lat: 36.5, lng: 127.8, pop: 52 },
  { code: 36, iso: 'AUS', name: 'Australia', region: 'Asia-Pacific', lat: -25.7, lng: 134.0, pop: 26 },
];

export const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));

export const getCountry = (code) => COUNTRY_BY_CODE[code];
