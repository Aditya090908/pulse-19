# PULSE 19

<p align="center"><strong>An interactive dashboard for exploring a simulated epidemiological dataset.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-16A34A?style=flat-square" alt="MIT License" />
</p>

PULSE 19 is a browser-based dashboard concept for exploring epidemiological indicators through an interactive map, country-level details, historical charts, filters, and downloadable reports.

> **Data notice:** PULSE 19 uses a local simulated demonstration dataset with a reference date of October 2024. It does not fetch live COVID-19 or public-health data and is not intended for medical, policy, or operational decision-making.

## Features

- Interactive map for selecting territories
- Country-level indicator details
- Historical charts with selectable time windows and metrics
- Search and sorting across country and indicator data
- CSV export of the displayed dataset
- Print-friendly reports that can be saved as PDF
- Local demonstration alerts and bulletins
- Dark and light themes

## Technology

| Technology | Purpose |
|---|---|
| React 18 | User interface |
| Vite 6 | Development server and build tooling |
| Tailwind CSS | Styling |
| JavaScript | Application logic |
| Local JSON | Demonstration data |
| SVG / chart and map utilities | Data visualization |

## Data Workflow

The application reads demonstration data from local JSON files in `src/data/`. It runs without API credentials or a backend service. Bundled data includes global summaries, country-level records, historical time series, and demonstration bulletins. Calculated indicators and table operations are handled by client-side utilities.

## Run Locally

Requirements: Node.js 18 or newer recommended, and npm.

```bash
git clone https://github.com/Aditya090908/pulse-19.git
cd pulse-19
npm install
npm run dev
```

Create and preview a production build:

```bash
npm run build
npm run preview
```

## Project Structure

```text
src/
├── components/   # Dashboard interface components
├── data/         # Local demonstration datasets
├── services/     # Data access helpers
└── utils/        # Calculations and formatting
```

## Project Status and Next Steps

PULSE 19 is a work-in-progress demonstration project. Future improvements include validating calculations, improving accessibility and responsive behavior, adding automated tests for data utilities, adding current screenshots, and publishing a hosted demo when deployment is ready.

## Author

**Aditya Kumar** · [@Aditya090908](https://github.com/Aditya090908)

## License

This project is licensed under the [MIT License](LICENSE).
