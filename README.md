# PULSE-19

<p align="center">
  <strong>An interactive public-health intelligence dashboard for outbreak reports, disease surveillance, country risk and epidemiological trends.</strong>
</p>

<p align="center">
  <a href="https://aditya090908.github.io/pulse-19/"><img src="https://img.shields.io/badge/🚀_Live_Demo-Open_Pulse--19-16a34a?style=for-the-badge" alt="Open live Pulse 19 demo" /></a>
  <a href="https://github.com/Aditya090908/pulse-19"><img src="https://img.shields.io/badge/GitHub-Source_Code-181717?style=for-the-badge&logo=github" alt="GitHub source code" /></a>
  <a href="https://pulse-19.onrender.com/docs"><img src="https://img.shields.io/badge/API-FastAPI_Docs-009688?style=for-the-badge&logo=fastapi" alt="FastAPI API documentation" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3" />
  <img src="https://img.shields.io/badge/FastAPI-Python_Backend-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Recharts-Analytics-8884D8?style=flat-square" alt="Recharts" />
  <img src="https://img.shields.io/badge/License-MIT-16A34A?style=flat-square" alt="MIT License" />
</p>

---

## Live deployment

| Service | Public URL | Purpose |
|---|---|---|
| **Pulse 19 web app** | [aditya090908.github.io/pulse-19](https://aditya090908.github.io/pulse-19/) | Public React frontend hosted with GitHub Pages |
| **FastAPI backend** | [pulse-19.onrender.com](https://pulse-19.onrender.com/) | Public API hosted on Render |
| **API health** | [health check](https://pulse-19.onrender.com/health) | Backend health status |
| **Interactive API docs** | [Swagger UI](https://pulse-19.onrender.com/docs) | Explore available API endpoints |
| **WHO reports API** | [WHO endpoint](https://pulse-19.onrender.com/api/v1/outbreaks?limit=5) | Recent WHO Disease Outbreak News reports |
| **CDC surveillance API** | [CDC endpoint](https://pulse-19.onrender.com/api/v1/surveillance/cdc/latest) | Latest available CDC NNDSS reporting period |

**Hosting note:** The frontend is a static GitHub Pages site; live WHO and CDC requests are served by the separate Render backend. The backend currently uses Render's free instance, which can spin down after inactivity. Its first request after a period of inactivity may take around 50 seconds or longer while the service wakes up. This is a cold-start delay, not a delay in loading the static website.

## Overview

PULSE-19 is an interactive public-health intelligence dashboard combining a simulated epidemiological demonstration dataset with integrations for real public-health information.

The platform brings together outbreak reporting, disease surveillance, country-level intelligence, geographic visualisation and interactive analytics.

It clearly distinguishes simulated demonstration figures from externally sourced surveillance information so visitors can understand the provenance and limitations of the data.

> **Important data notice:** The original overview and country-level outbreak metrics are simulated. WHO outbreak reports and CDC surveillance records are retrieved from external sources. CDC figures are provisional and may be revised. This project is for demonstration and informational purposes, not medical, policy or operational decision-making.

## Features

| Section | Features |
|---|---|
| **Overview** | Headline demonstration metrics, outbreak map, highest-risk countries, alerts, trends and regional comparisons. Figures are simulated. |
| **Global Map** | Interactive country boundaries, risk-coloured markers, zoom controls, hover summaries and country briefings. |
| **Disease Analytics** | Disease, region, country and time filters, trend charts, regional comparisons and CSV export. |
| **Country Intelligence** | Searchable, sortable and filterable country information with risk levels and reporting dates. |
| **Monitoring** | Disease monitoring cards, outbreak counts, trends, risk classifications and affected-country information. |
| **CDC Surveillance** | Real CDC NNDSS numerical surveillance records, disease rankings, reporting-area comparisons, YTD comparisons, filters and CSV export. |
| **Alerts** | Alert categories, severity filters, read/unread state and WHO outbreak intelligence reports. |
| **Global Search** | Search for countries and diseases across the dashboard. |
| **Themes** | Dark and light themes. |
| **Reports** | CSV exports and printable situation reports. |

## Live public-health data integrations

### WHO Disease Outbreak News

**Provider:** World Health Organization (WHO)  
**Source API:** [WHO Disease Outbreak News](https://www.who.int/api/hubs/diseaseoutbreaknews)  
**Pulse 19 endpoint:** [GET /api/v1/outbreaks](https://pulse-19.onrender.com/api/v1/outbreaks?limit=5)

The backend retrieves official WHO Disease Outbreak News reports and exposes them through the application API.

- Retrieves official outbreak reports.
- Displays report titles, publication dates and available summaries.
- Links to original WHO publications.
- Keeps WHO reports separate from simulated dashboard alerts.

**Scope limitation:** WHO Disease Outbreak News is a report feed. It is not a complete global numerical case-surveillance dataset and should not be presented as one.

### CDC National Notifiable Diseases Surveillance System (NNDSS)

**Provider:** US Centers for Disease Control and Prevention (CDC)  
**Dataset:** [CDC NNDSS Weekly Data — x9gk-5huc](https://data.cdc.gov/d/x9gk-5huc)  
**Source API:** [CDC Socrata API](https://data.cdc.gov/resource/x9gk-5huc.json)  
**Pulse 19 endpoint:** [GET /api/v1/surveillance/cdc/latest](https://pulse-19.onrender.com/api/v1/surveillance/cdc/latest)

The backend discovers the latest available reporting period, counts its records and retrieves the period's records using pagination.

The integration includes:

- Current-week reported values.
- Previous 52-week maximum.
- Cumulative year-to-date values.
- Previous-year cumulative YTD values.
- Reporting-area comparisons.
- Disease-wise analytics.
- Pagination and completeness metadata.
- CDC reporting flags and their explanations.
- Search, filters and CSV export.

**Verified deployment check (15 November 2026):** The public surveillance page successfully displayed 8,400 records for reporting year 2026, week 44, across 70 reporting areas and 120 disease categories, with pagination marked complete. This is a verification snapshot from that reporting period, not a guaranteed permanent count; the API discovers the latest available period and counts can change.

**Data limitations:**

- CDC reporting areas represent US reporting jurisdictions, not countries.
- CDC surveillance data is provisional and may be revised.
- A missing or flagged value must not automatically be interpreted as zero.
- Disease-category totals can overlap and should not automatically be treated as unique national case totals.
- The previous 52-week maximum is a reference value, not a historical weekly time series.

## Data provenance and integrity

| Data category | Source | Status |
|---|---|---|
| Original overview outbreak metrics | Local demonstration data generator | Simulated |
| Risk scores and derived indicators | Dashboard calculations | Derived from simulated data |
| Country names and geographic reference information | Local country dataset | Reference data |
| Country boundaries | Natural Earth via world-atlas | Geographic reference |
| WHO outbreak reports | WHO Disease Outbreak News | Real official reports |
| Numerical disease surveillance | CDC NNDSS | Real, provisional surveillance data |

WHO and CDC are separate sources with different geographic coverage, reporting periods and data structures. Their records are not combined into a single global case-count figure.

## Architecture

The application is deployed as a static frontend plus a separately hosted API:

```text
Visitor's browser
      |
      v
GitHub Pages — React + Vite frontend
      |
      | HTTPS API requests
      v
Render — FastAPI backend
      |
      +--------------------+
      |                    |
      v                    v
WHO Disease Outbreak     CDC NNDSS
News API                 Socrata API
      |                    |
      +----------+---------+
                 |
                 v
       Normalized API responses
                 |
                 v
        Pulse 19 data views
```

The simulated dashboard dataset remains local to the frontend. The WHO and CDC integrations use the public FastAPI backend.

## Technology stack

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
| GitHub Pages | Static frontend hosting and deployment |
| Render | FastAPI backend hosting |

## Project structure

```text
pulse-19/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── backend/
│   └── app/
│       ├── main.py
│       └── services/
│           ├── who_service.py
│           └── cdc_service.py
├── public/
├── scripts/
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
│   └── utils/
├── .env.example
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
└── vite.config.js
```

## Run locally

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

Open the local URL printed by Vite.

### 4. Start the backend

Open another terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend health check: http://127.0.0.1:8000/health  
Interactive API documentation: http://127.0.0.1:8000/docs

For local frontend-to-backend requests, the backend CORS configuration must allow the local Vite origin. The deployed frontend uses the Render API base URL configured in the GitHub Pages workflow.

## Deployment

- **Frontend:** GitHub Actions builds the Vite app and deploys the `dist/` directory to GitHub Pages on pushes to `main`.
- **Backend:** Render runs the FastAPI application from the `backend/` directory.
- **Frontend API URL:** The Pages workflow supplies `VITE_API_BASE_URL=https://pulse-19.onrender.com` at build time.
- **CORS:** The backend allows the deployed GitHub Pages origin.

Useful deployment pages:
- [GitHub Actions workflow runs](https://github.com/Aditya090908/pulse-19/actions)
- [GitHub Pages settings](https://github.com/Aditya090908/pulse-19/settings/pages)
- [Render backend](https://pulse-19.onrender.com/)

## Build and checks

From the project root:

```bash
npm run check
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Testing checklist

1. Run `npm run check` and `npm run build`.
2. Open the overview and verify that simulated-data notices are visible.
3. Navigate through the map, analytics, country intelligence and monitoring pages.
4. Open Alerts and verify that WHO reports load from the backend.
5. Open Surveillance and verify that CDC records load.
6. Check the CDC reporting period and pagination status.
7. Test disease search and reporting-area filters.
8. Change the selected disease and verify that comparison charts update.
9. Test CSV export.
10. Verify that CDC reporting flags and provisional-data notices are preserved.
11. Test dark and light themes and responsive layouts.

## Limitations

- The original overview and country-level outbreak metrics remain simulated.
- WHO outbreak reports do not represent complete global numerical surveillance.
- CDC NNDSS covers US reporting jurisdictions rather than worldwide reporting areas.
- CDC data is provisional and may be revised.
- The monitored-country demonstration dataset is not complete global coverage.
- Disease categories and reporting definitions may differ between data providers.
- Cross-provider comparisons require compatible definitions, periods and geographic coverage.
- Render's free instance can spin down after inactivity, delaying the first live API request while it wakes.
- The dashboard is not a validated epidemiological decision-support system.

## Future improvements

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
Project repository: [Aditya090908/pulse-19](https://github.com/Aditya090908/pulse-19)  
Live project: [Open PULSE-19](https://aditya090908.github.io/pulse-19/)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
