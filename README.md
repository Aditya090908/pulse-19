# PULSE 19

<p align="center">
  <strong>An interactive epidemiological dashboard for exploring a simulated public-health dataset.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-16A34A?style=flat-square" alt="MIT License" />
</p>

PULSE 19 is a browser-based dashboard concept for exploring epidemiological indicators through an interactive map, country-level details, historical charts, filters, and downloadable reports.

> [!IMPORTANT]
> **Data notice:** PULSE 19 uses a local simulated demonstration dataset with a reference date of October 2024. It does not fetch live COVID-19 or public-health data, and it is not intended for medical, policy, or operational decision-making.

## What you can explore

- **Interactive map** — select a territory and inspect its available dataset.
- **Country detail view** — review calculated indicators and country-level values.
- **Historical charts** — switch between available time windows and metrics.
- **Search and sorting** — explore the territory table by country and indicator.
- **CSV export** — download the displayed dataset.
- **Print-friendly report** — use the browser's print dialog to save a report as PDF.
- **Local alerts panel** — view demonstration bulletins bundled with the project.
- **Theme options** — switch between the dashboard's dark and light themes.

All displayed figures are based on bundled demo data, not a live surveillance feed.

## Technology

| Technology | Purpose |
|---|---|
| React 18 | User interface |
| Vite 6 | Development server and build tooling |
| Tailwind CSS | Styling |
| JavaScript | Application logic |
| Local JSON | Demonstration data |
| SVG / chart and map utilities | Data visualization |

## How the data works

The application reads its demonstration data from local JSON files in `src/data/`. The project is designed to run without API credentials or a backend service.

The bundled data includes:
- Global summary values
- Country-level records
- Historical time-series
- Demonstration alerts and bulletins

Calculated indicators and table operations are handled by client-side utility functions.

## Run locally

### Requirements

- Node.js (18 or newer recommended)
- npm

### Install dependencies

```bash
git clone https://github.com/Aditya090908/pulse-19.git
cd pulse-19
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

### Create a production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project structure

```text
src/
├── components/   # Dashboard interface components
├── data/         # Local demonstration datasets
├── services/     # Data access helpers
└── utils/        # Calculations and formatting
```

## Project status

PULSE 19 is a demonstration project and remains a work in progress. The current repository documents the existing dashboard concept and local-data workflow. Further work should focus on validating calculations, improving accessibility and responsive behavior, adding project screenshots, and testing the production build.

## Possible next steps

- [ ] Add current screenshots of the running dashboard
- [ ] Verify all dashboard interactions and calculations
- [ ] Add automated tests for data utilities
- [ ] Improve accessibility and mobile layouts
- [ ] Add a hosted demo if a reliable deployment is available

## Author

**Aditya Kumar** · [@Aditya090908](https://github.com/Aditya090908)

## License

This project is licensed under the [MIT License](LICENSE).
