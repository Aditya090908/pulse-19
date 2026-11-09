# 🛰️ PULSE19 — Global Epidemiological Bio-Observatory

[![React](https://img.shields.io/badge/React-18.3-06B6D4?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00FFaa.svg)](LICENSE)

An advanced real-time epidemiological telemetry and bio-surveillance command center. Designed with a custom **Obsidian & Electric Cyan** aesthetic, featuring multi-curve trajectory visualizers, regional diagnostics telemetry, and algorithmic severity ratios.

---

## ⚡ Bespoke Design & Capabilities

- **📡 Bio-Intelligence Telemetry Bar**:
  - Live algorithmic ratio computations across 230+ monitored territories.
  - Real-time **Global Recovery Ratio %**, **Case Fatality Rate (CFR %)**, and **ICU Severity Index** with glowing neon progress gauges.

- **📊 Command Cockpit Metrics**:
  - Monospace telemetry tags (`[01] Confirmed Influx`, `[02] Active Load`, `[03] Full Recoveries`, `[04] Fatalities`).
  - Active metric selection with glowing cyan, amber, emerald, and coral illumination states.
  - Monospace 24h influx delta badges.

- **📈 Multi-Curve Trajectory Visualizer**:
  - High-performance SVG sparklines with custom glowing filters (`feDropShadow`).
  - **Dual Compare Mode**: Overlay confirmed cases against recoveries simultaneously on the same timeline.
  - Interactive crosshair scrubber with instant timestamp and volume inspection.
  - One-click toggling between **Cumulative** trajectory and **Daily Influx** delta.

- **🔬 Regional Deep Diagnostics**:
  - Detailed diagnostic panel reporting Critical ICU load, Tests Conducted, Infection Density per 1M, and Mortality per 1M.
  - Real-time population telemetry and per-capita testing ratios.

- **📋 Territory Surveillance Matrix**:
  - Searchable node rankings with country flag telemetry.
  - One-click filters: `TOP 10 Nodes`, `>95% Recovery Rate`, and custom multi-metric sorting (`CASES`, `+24H`, `REC`, `DEATHS`).
  - Integrated micro-progress bars on every country row.

- **🛡️ 100% Resilient Architecture**:
  - Live data ingestion from REST APIs with zero-latency failover to embedded telemetry datasets for uninterrupted offline performance.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 (Functional Components, Custom Hooks) |
| **Bundler & Tooling** | Vite 6 (Lightning-fast HMR and ESM build pipeline) |
| **Theme & UI System** | Custom Tailwind CSS Cyber-Obsidian / Neon-Cyan System |
| **Data Visualization** | Responsive SVG Line Engines with SVG Glow Filter primitives |
| **Iconography** | Lucide React |

---

## 📁 Source Code Organization

```
D:\pulse-19/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Command center navigation & telemetry indicators
│   │   ├── GlobalStatusBar.jsx  # Recovery, Lethality & ICU telemetry gauges
│   │   ├── MetricCard.jsx       # Micro-meter telemetry metric cards
│   │   ├── TrendChart.jsx       # Glowing SVG multi-curve trajectory engine
│   │   └── CountryTable.jsx     # Node surveillance matrix with quick filters
│   ├── services/
│   │   ├── api.js               # Resilient REST client with auto-failover
│   │   └── mockData.js          # High-fidelity offline telemetry dataset
│   ├── utils/
│   │   └── formatters.js        # Precision number and date formatters
│   ├── App.jsx                  # Main command center shell
│   ├── index.css                # Cyber-grid background & neon glow utility rules
│   └── main.jsx                 # React root bootstrap
├── index.html                   # HTML entry with font preloads
├── package.json                 # Dependency manifest
├── tailwind.config.js           # Design tokens & color system
└── vite.config.js               # Build & dev server configuration
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+) & `npm`

### Instructions

1. **Clone repository:**
   ```bash
   git clone https://github.com/Aditya090908/pulse-19.git
   cd pulse-19
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local observatory server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Compile optimized production build:**
   ```bash
   npm run build
   ```

---

## 👤 Author

- **Aditya** — [@Aditya090908](https://github.com/Aditya090908)

---

## 📄 License

Open-source and released under the [MIT License](LICENSE) — engineered by Aditya090908.
