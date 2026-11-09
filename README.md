# 🛰️ PULSE 19 — Standalone Epidemiological Bio-Observatory (Zero-API)

[![React](https://img.shields.io/badge/React-18.3-06B6D4?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00FFaa.svg)](LICENSE)
[![Zero API](https://img.shields.io/badge/API-NONE%20(100%25%20Offline)-brightgreen)](#)

A senior-engineered, zero-API epidemiological surveillance and public health telemetry dashboard. Built entirely using client-side React 18, Tailwind CSS, and local JSON datasets with a custom **Cyber-Obsidian & Electric Cyan** observatory interface.

> [!NOTE]
> **Dataset Classification**: This project operates strictly on a **local simulated demonstration archive (Reference Date: October 2024)**. It makes **zero external API calls**, requires **no API keys**, and has **no backend dependency**.

---

## 🌟 Enhanced Capabilities

### 1. 🗺️ Local Interactive Vector World Map
- Built with custom, self-contained SVG country boundaries (zero external map tiles or CDN requests).
- **Infection Intensity Choropleth**: Color-coded across 4 dynamic severity thresholds (`<5M`, `5M-15M`, `15M-35M`, `>35M`).
- **Interactive Tooltips**: Displays country flag, ISO codes, confirmed cases, recoveries, fatalities, and recovery rates on hover.
- **Interactive Controls**: Zoom In (`+`), Zoom Out (`-`), and Reset (`↺`) view controls.
- **Deep Inspection**: Clicking any territory launches the dedicated **Country Detail Dossier**.

### 2. 🗂️ Country Detail Dossier Modal
- Comprehensive telemetry card for any clicked nation.
- Computes active ICU load, recovery %, mortality %, cases per 1M, and deaths per 1M using reusable mathematical utilities.
- Interactive 7-day influx progression sparkline.

### 3. 📈 Multi-Timeframe Epidemiological Trajectory Engine
- **Timeframe Filtering**: One-click toggling between **7-Day**, **30-Day**, **90-Day**, and **All-Time** historical timelines.
- **Metric Selectors**: Filter curves by **Confirmed Cases**, **Recoveries**, or **Fatalities**.
- **Curve Comparisons**: Overlay recovery curves against infection curves simultaneously.
- **Dual Display Modes**: Toggle between **Cumulative Total** and **Daily Influx Delta**.
- **Crosshair Hover Scrubber**: Precision hover inspection with real-time timestamps and values.

### 4. 📋 Territory Surveillance Matrix
- Real-time instant search by country name or ISO2/ISO3 code.
- Multi-column sorting: Total Cases, 24h Influx, Recoveries, Deaths, and Recovery Rate %.
- Quick filter pills: `ALL`, `TOP 10`, `>95% REC`, and `>2% CFR`.
- Inline visual recovery progress bars for every nation.
- Clicking any row opens its detailed telemetry dossier.

### 5. ⚡ Advanced Operational Utilities
- **⌨️ Ctrl + K Command Palette**: Universal spotlight search for rapid territory navigation, metric switching, and action execution.
- **📥 Client-Side CSV Export**: Generates and downloads standard CSV surveillance datasets instantly with zero dependencies.
- **🖨️ Client-Side PDF Report Generator**: Dedicated `@media print` formatted executive report view ready for browser print or Save as PDF.
- **🔔 Epidemiological Bulletins Drawer**: Slide-over drawer displaying categorized health bulletins and alerts from local JSON.
- **🌓 Theme Engine**: Switch between **Cyber Obsidian** (Dark Mode) and **Clinical Observatory** (Light Mode).
- **⏳ Loading Skeletons & Empty States**: Polished shimmer skeletons during state changes and informative fallback states.

---

## 📁 Local Data Architecture (`src/data/`)

```
src/data/
├── global-stats.json       # Worldwide epidemiological telemetry & reference dates
├── countries.json          # 20-nation local baseline dataset with flags & coords
├── historical-stats.json   # 7D, 30D, 90D, and All-Time chronological time-series
└── alerts.json             # Categorized surveillance dispatches & bulletins
```

All calculations are centralized inside `src/utils/dataEngine.js`:
- `calculateActiveCases(cases, recovered, deaths)`
- `calculateRecoveryPercentage(recovered, cases)`
- `calculateMortalityPercentage(deaths, cases)`
- `calculateCasesPerMillion(cases, population)`
- `calculateDeathsPerMillion(deaths, population)`
- `sortCountries(countries, sortBy, sortDirection)`
- `filterCountries(countries, options)`
- `exportToCSV(countries, filename)`
- `triggerPrintReport()`

---

## 🛠️ Project Structure

```
D:\covid-tracker/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Command center navigation, demo label, controls
│   │   ├── GlobalStatusBar.jsx     # Global recovery, lethality & ICU ratio gauges
│   │   ├── MetricCard.jsx          # Telemetry metric cards with loading skeletons
│   │   ├── WorldMap.jsx            # Local SVG Choropleth Map with zoom/reset
│   │   ├── TrendChart.jsx          # Multi-timeframe SVG trajectory engine
│   │   ├── CountryTable.jsx        # Surveillance matrix with CSV export & filters
│   │   ├── CountryDetailModal.jsx  # Detailed country telemetry dossier modal
│   │   ├── CommandPalette.jsx      # Ctrl + K universal spotlight modal
│   │   └── AlertsDrawer.jsx        # Dispatches & surveillance bulletins drawer
│   ├── data/                       # Single source of truth local JSON datasets
│   │   ├── global-stats.json
│   │   ├── countries.json
│   │   ├── historical-stats.json
│   │   └── alerts.json
│   ├── services/
│   │   └── dataService.js          # Synchronous zero-API data provider
│   ├── utils/
│   │   ├── dataEngine.js           # Reusable mathematical & export utilities
│   │   └── formatters.js           # Precision number and date formatters
│   ├── App.jsx                     # Central observatory dashboard coordinator
│   ├── index.css                   # Cyber-grid, print stylesheet & theme rules
│   └── main.jsx                    # Application entry
├── index.html                      # HTML shell & font preloads
├── package.json                    # Project manifest
├── tailwind.config.js              # Theme design tokens
└── vite.config.js                  # Vite configuration
```

---

## 🚀 Running the Application

### Prerequisites
- Node.js (v18+)

### Development Server
```bash
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Production Build
```bash
npm run build
```

---

## 👤 Author

- **Aditya** — [@Aditya090908](https://github.com/Aditya090908)

---

## 📄 License

Open-source and licensed under the [MIT License](LICENSE).
