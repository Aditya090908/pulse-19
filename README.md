# PULSE-19

<p align="center">
  <strong>A global health intelligence dashboard for exploring outbreaks, country risk and disease trends.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3" />
  <img src="https://img.shields.io/badge/License-MIT-16A34A?style=flat-square" alt="MIT License" />
</p>

> [!IMPORTANT]
> **All outbreak figures are simulated.** PULSE-19 generates a reproducible demonstration dataset in the browser. It does not fetch live or verified public-health data and must not be used for medical, policy or operational decisions. The interface labels simulated data on every screen, in every export and in the printed report.

## What you can do

| Section | What it offers |
|---|---|
| **Overview** | Four headline metrics with 30-day trend lines, a compact outbreak map, highest-risk countries, latest alerts, weekly case trend, disease share and a regional comparison. |
| **Global map** | Leaflet map of country boundaries with risk-coloured markers sized by cases, last-30-day cases or fatalities. Disease, region and risk filters, zoom and reset controls, hover summaries, click for a full country briefing. |
| **Disease analytics** | Filters for disease, region, country, time period and resolution. Case and fatality trends, disease-wise trend cards, regional comparison, disease distribution and a 12-month historical view. CSV export of the current trend. |
| **Country intelligence** | Searchable, sortable, filterable, paginated table of countries with trend, risk level and last-reported date. Click a row for the country briefing. |
| **Monitoring** | Eight diseases with outbreak counts, spread, trend and risk classification. Select one for its map, regional history and most affected countries. Includes an explanation of how risk is classified. |
| **Alerts** | Critical outbreaks, case increases, new regional outbreaks, risk-level changes and reporting delays, with severity, timestamps, read/unread state and filters. |
| **Everywhere** | Global search (press `/`), notification menu, dark and light themes, CSV export, a printable situation report (use the browser's print dialog to save as PDF) and responsive layouts. |

The **country briefing** (side panel) shows the affected diseases, reported cases, fatalities, recovery information, recent activity chart, derived indicators (fatality ratio, recovery rate, cases per 100,000, 7-day average, peak day, reporting lag), regional ranking, related alerts and the reporting date.

## Simulated versus real data

| Kind | What it covers | Source |
|---|---|---|
| **Simulated** | Cases, fatalities, recoveries, trends, risk scores for 40 countries and 8 diseases | Seeded generator in `src/data/generateSnapshot.js`. Invented. |
| **Derived** | Alerts, situation summaries, indicators | Calculated from the simulated figures. |
| **Reference** | Country names, regions, marker positions, approximate populations | Static labels in `src/data/countries.js`. Not verified for this use. |
| **Real** | Country boundaries drawn on the map | Natural Earth, via the `world-atlas` package. |

No verified real-world outbreak data is used anywhere. The seed table in `src/data/outbreakSeed.js` describes invented scenarios, not real outbreaks. The generator is deterministic for a given reference date, so results are reproducible. Alerts, read states and the theme are stored in `localStorage` only.

### Connecting a real source later

`src/services/dataService.js` is the single place the app obtains data. Return a snapshot with the same shape as `generateSnapshot()` (`{ meta, dates, outbreaks }`), set `meta.simulated` to `false`, and update the notice texts in `src/components/common/DataStatus.jsx`.

## Technology

| Technology | Purpose |
|---|---|
| React 18 | Interface |
| Vite 6 | Dev server and build |
| Tailwind CSS 3 | Styling, with theme tokens as CSS variables |
| Leaflet | Interactive map |
| d3-geo, topojson-client, world-atlas | Boundary geometry and country silhouettes |
| Recharts | Analytics charts |
| lucide-react | Icons |

Routing is a small hash router (`src/hooks/useHashRoute.js`), so no extra dependency is needed and the app can be hosted as static files.

## Run locally

Requirements: Node.js 18 or newer, and npm.

```bash
git clone https://github.com/Aditya090908/pulse-19.git
cd pulse-19
npm install
npm run dev
```

Open the URL Vite prints (port 3000 by default).

`package.json` now includes `recharts`, so run `npm install` once to refresh `package-lock.json` before committing.

```bash
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run check     # offline check of imports, exports and dependency references
```

Optional: set `VITE_PULSE_REFERENCE_DATE` (see `.env.example`) to pin the dataset's reference date.

## Testing checklist

After `npm install`, confirm the following by hand. Each item maps to behaviour the code is written to provide.

1. `npm run check` reports no problems, and `npm run build` completes without errors.
2. **Overview**: four metric cards and the simulated-data notice at the top. Refresh shows a busy state, then recovers.
3. **Map**: markers appear in four colours, sized by the selected metric. Hover shows a tooltip, click opens the country panel. Zoom in, out and reset work. Choosing a region flies to it. Switching theme recolours the map.
4. **Country panel**: shows diseases, cases, fatalities, recovered, reporting date, a trend chart, indicators and regional rank. Escape closes it and returns focus.
5. **Countries**: sort by clicking headers, search `ind` (India, Indonesia), filter risk to Critical, page through results, export CSV (every row ends in `SIMULATED DEMO DATA`).
6. **Analytics**: change every filter. Disease Marburg with region Asia-Pacific shows the empty state. A 12-month window explains that no earlier period exists.
7. **Monitoring**: pick each disease card, and check the URL changes to `#/diseases/<id>`.
8. **Alerts**: filter by severity, type and unread. Mark one read, then all read, reload the page and confirm the state persists.
9. **Search**: press `/`, type `cholera`, press Enter, then search `yemen` and open its panel.
10. **Print**: press Print report, then check the preview shows a white report with the simulated-data banner and no navigation.
11. **Responsive**: narrow the window to about 375px. Navigation scrolls horizontally, tables scroll inside their cards, and nothing overflows the page.
12. **Keyboard**: Tab reaches every control with a visible focus ring, and "Skip to content" appears on the first Tab.

## Project structure

```text
index.html                     Entry document, theme-colour meta, pre-paint theme script
public/favicon.svg             Amber pulse mark
scripts/check-imports.mjs      Offline import/export/dependency checker
src/
├── main.jsx                   React entry
├── App.jsx                    Router, loading and error states
├── index.css                  Theme tokens (dark/light), Leaflet and print styles
├── context/AppContext.jsx     Snapshot, theme, selection, alerts and read state
├── layouts/                   App shell (header, nav, footer), navigation config
├── pages/                     Overview, Map, Analytics, Countries, Diseases, Alerts
├── components/
│   ├── common/                Cards, buttons, badges, search, popovers, pagination, data notices
│   ├── charts/                Recharts wrappers: series, donut, comparison bars, tooltip, theme
│   ├── map/                   Leaflet map, legend, metric options
│   ├── country/               Country briefing panel and d3-geo silhouette
│   ├── dashboard/             Metric cards
│   ├── alerts/                Alert item and icons
│   └── print/                 Print-only situation report
├── data/                      Diseases, countries, seed scenarios, snapshot generator
├── services/                  Data service, geometry, CSV export and print, safe storage
├── hooks/                     Hash router, persistent state, click-outside, chart theme
└── utils/                     Aggregation, risk model, alerts, insights, formatting, RNG
```

## Design system

Charcoal surfaces, amber as the primary accent, gold as the secondary accent and crimson for critical states, defined in `tailwind.config.js` and as CSS variables in `src/index.css`. The light theme keeps the same structure with a warm paper background and darker amber for contrast. Risk uses one four-level scale everywhere: Critical (crimson), High (orange), Moderate (gold) and Low (grey).

## Limitations

- Figures are simulated, and the risk score is a transparent demonstration heuristic, not a validated epidemiological model.
- Country markers use a single approximate point per country, and sub-national detail is not modelled.
- There is no automated test suite yet. Adding unit tests for `src/utils/` and an end-to-end test of the checklist above would be the natural next step.

## Author

**Aditya Kumar** · [@Aditya090908](https://github.com/Aditya090908)

## License

This project is licensed under the [MIT License](LICENSE).
