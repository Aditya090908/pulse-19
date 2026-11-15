# PULSE-19

<p align="center">
  <strong>A public health intelligence dashboard for exploring outbreaks, disease surveillance, country risk and epidemiological trends.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React_Charts-Recharts-8884D8?style=flat-square" alt="Recharts" />
  <img src="https://img.shields.io/badge/License-MIT-16A34A?style=flat-square" alt="MIT License" />
</p>

---

## Overview

PULSE-19 is an interactive public health intelligence dashboard combining a simulated epidemiological demonstration dataset with integrations for real public health information.

The platform brings together outbreak reporting, disease surveillance, country-level intelligence, geographic visualisation and interactive analytics.

It distinguishes between simulated demonstration figures and externally sourced surveillance information so that users can understand the provenance and limitations of the data.

> **Important data notice:** The original dashboard's outbreak figures are simulated. WHO outbreak reports and CDC surveillance records are retrieved from external sources. CDC figures are provisional and may be revised. This project is for demonstration and informational purposes, not medical, policy or operational decision-making.

## Features

| Section | Features |
|---|---|
| **Overview** | Headline metrics, outbreak map, highest-risk countries, alerts, trends and regional comparisons using the demonstration dataset. |
| **Global Map** | Interactive country boundaries, risk-coloured markers, zoom controls, hover summaries and country briefings. |
| **Disease Analytics** | Disease, region, country and time filters, trend charts, regional comparisons and CSV export. |
| **Country Intelligence** | Searchable, sortable and filterable country information with risk levels and reporting dates. |
| **Monitoring** | Disease monitoring cards, outbreak counts, trends, risk classifications and affected-country information. |
| **CDC Surveillance** | Real CDC NNDSS numerical surveillance records, disease rankings, reporting-area comparisons, YTD comparisons, filters and CSV export. |
| **Alerts** | Alert categories, severity filters, read/unread state and WHO outbreak intelligence reports. |
| **Global Search** | Search for countries and diseases across the dashboard. |
| **Themes** | Dark and light themes. |
| **Reports** | CSV exports and printable situation reports. |

## Live Public Health Data Integrations

### 1. WHO Disease Outbreak News

**Source:** World Health Organization

API endpoint:

`https://www.who.int/api/hubs/diseaseoutbreaknews`

The backend retrieves official WHO Disease Outbreak News reports and exposes them through the application API.

Features:
- Retrieves official outbreak reports.
- Displays report titles and publication dates.
- Shows available summaries and report information.
- Provides links to original WHO publications.
- Separates official WHO reports from simulated dashboard alerts.

**Important:** WHO Disease Outbreak News provides outbreak reports, not a complete global numerical case-surveillance dataset.

### 2. CDC National Notifiable Diseases Surveillance System

**Source:** US Centers for Disease Control and Prevention (CDC)

Dataset: `x9gk-5huc`

Dataset URL:

`https://data.cdc.gov/d/x9gk-5huc`

API endpoint:

`https://data.cdc.gov/resource/x9gk-5huc.json`

The backend retrieves CDC NNDSS weekly surveillance records and exposes the latest available reporting period to the frontend.

The CDC integration includes:

- Current-week reported values.
- Previous 52-week maximum.
- Cumulative year-to-date values.
- Previous-year cumulative YTD values.
- Reporting-area comparisons.
- Disease-wise analytics.
- Pagination for retrieving records.
- CDC reporting flags and their explanations.
- Search, filters and CSV export.

Backend endpoint:

`GET /api/v1/surveillance/cdc/latest`

**Data limitations:**

- CDC reporting areas represent US reporting jurisdictions, not countries.
- CDC surveillance data is provisional and may be revised.
- A missing or flagged value must not automatically be interpreted as zero.
- Disease-category totals can overlap and should not automatically be treated as unique national case totals.
- The previous 52-week maximum is a reference value, not a historical weekly time series.

## Data Provenance and Integrity

PULSE-19 uses different categories of information:

| Data category | Source | Status |
|---|---|---|
| Original outbreak metrics | Local demonstration data generator | Simulated |
| Risk scores and derived indicators | Dashboard calculations | Derived from simulated data |
| Country names and geographic reference information | Local country dataset | Reference data |
| Country boundaries | Natural Earth via world-atlas | Geographic reference |
| WHO outbreak reports | WHO Disease Outbreak News | Real official reports |
| Numerical disease surveillance | CDC NNDSS | Real, provisional surveillance data |

The WHO and CDC integrations are separate data sources with different geographic coverage, reporting periods and data structures.

Their records are not combined into a single global case-count figure.

## Technology Stack

| Technology | Purpose |
|---|---|
| React 18 | Frontend user interface |
| Vite 6 | Development server and production build |
| Tailwind CSS 3 | Styling and responsive design |
| JavaScript | Application logic |
| FastAPI | Backend API |
| Python | Backend services and data processing |
| HTTPX | External API requests |
| Recharts | Interactive analytics charts |
| Leaflet | Interactive geographic maps |
| D3 Geo | Geographic projections |
| TopoJSON / world-atlas | Country boundary geometry |
| Lucide React | Interface icons |

## Application Architecture

The project uses a frontend and backend architecture.

```text
                    PULSE-19
                       |
             +---------+---------+
             |                   |
          Frontend             Backend
          React/Vite           FastAPI
             |                   |
             |             +-----+------+
             |             |            |
             |            WHO          CDC
             |         Outbreak       NNDSS
             |          Reports    Surveillance
             |             |            |
             +-------------+------------+
                           |
                    Dashboard Display
```

The frontend communicates with the FastAPI backend for live WHO and CDC information.

The original demonstration dashboard continues to use its local simulated data services.

## Project Structure

```text
pulse-19/
│
├── backend/
│   └── app/
│       ├── main.py
│       └── services/
│           ├── who_service.py
│           └── cdc_service.py
│
├── public/
│
├── scripts/
│
├── src/
│   ├── components/
│   │   ├── alerts/
│   │   ├── charts/
│   │   ├── common/
│   │   ├── country/
│   │   ├── dashboard/
│   │   ├── map/
│   │   ├── print/
│   │   └── surveillance/
│   │       └── CDCSurveillance.jsx
│   │
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   │   ├── cdcApi.js
│   │   ├── dataService.js
│   │   ├── exportService.js
│   │   ├── geoService.js
│   │   └── whoApi.js
│   │
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
└── vite.config.js
```

## Run Locally

### Prerequisites

- Node.js 18 or newer.
- npm.
- Python installed for the backend.
- Git.

### 1. Clone the repository

```bash
git clone https://github.com/Aditya090908/pulse-19.git

cd pulse-19
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

### 4. Start the backend

Open another terminal:

```powershell
cd backend
```

Create a Python virtual environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

Start FastAPI:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend health check:

`http://127.0.0.1:8000/health`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

## Build for Production

From the frontend project root:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Testing

Recommended checks:

1. Run `npm run build` and verify that the production build completes.
2. Open the overview and verify that simulated-data notices are visible.
3. Navigate through the global map, analytics, country intelligence and monitoring pages.
4. Open Alerts and verify that WHO reports load from the backend.
5. Open Surveillance and verify that CDC records load.
6. Check the CDC reporting period and pagination status.
7. Test disease search and reporting-area filters.
8. Change the selected disease and verify that comparison charts update.
9. Test CSV export.
10. Verify that CDC reporting flags and provisional-data notices are preserved.
11. Test dark and light themes.
12. Test the responsive layout.

## Limitations

- The original overview and country-level outbreak metrics remain simulated.
- WHO outbreak reports do not represent complete global numerical surveillance.
- CDC NNDSS covers US reporting jurisdictions rather than worldwide reporting areas.
- CDC data is provisional and may be revised.
- The monitored-country demonstration dataset is not complete global coverage.
- Disease categories and reporting definitions may differ between data providers.
- Cross-provider comparisons require compatible definitions, periods and geographic coverage.
- The dashboard is not a validated epidemiological decision-support system.

## Future Improvements

- Integrate additional regional and national public-health surveillance sources.
- Expand geographic coverage with verified country-level datasets.
- Add historical surveillance data where reliable source records are available.
- Improve cross-source disease comparisons.
- Add automated backend and frontend tests.
- Optimise chart rendering and frontend bundle size.
- Improve deployment and production monitoring.

## Author

**Aditya Kumar**

GitHub: [@Aditya090908](https://github.com/Aditya090908)

Project: [PULSE-19](https://github.com/Aditya090908/pulse-19)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
