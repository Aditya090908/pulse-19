# 🦠 COVID-19 & Pandemic Analytics Tracker

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A real-time, interactive global epidemiological analytics dashboard tracking outbreaks, recoveries, and mortality trends worldwide. Built with **React 18**, **Vite**, **Tailwind CSS**, and **Leaflet** with CartoDB Dark Matter styling.

---

## 🌟 Key Features

- **🌐 Real-Time Global Outbreak Map**: Interactive geospatial map with dynamic circle markers proportional to severity, fly-to-country zooming, and detailed country popups.
- **📊 Metric Cards with Live Trends**: Filterable cards for Total Cases, Active ICU Cases, Recoveries, and Mortality with daily 24h delta tracking.
- **📈 Interactive Time-Series Charts**: Custom responsive SVG sparklines displaying historical trajectory curves with Cumulative vs. Daily New toggle views and hover inspection.
- **📋 Live Country Rankings Table**: Real-time sortable and searchable country rankings with instant filtering and flag icons.
- **⚡ Resilient Architecture**: Connects to live public REST APIs (`disease.sh`) with intelligent client-side caching and fallback mock datasets to guarantee 100% uptime.
- **🎨 Modern Dark Mode Design**: Designed from scratch with clean typography, smooth transitions, and glassmorphism accents.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | Functional components, hooks, reactive state management |
| **Vite** | Next-generation frontend build tooling |
| **Tailwind CSS** | Utility-first responsive styling and dark mode |
| **Leaflet** | Interactive geospatial mapping and custom circle layers |
| **Lucide React** | Modern, lightweight icon suite |

---

## 📁 Project Structure

```
covid-tracker/
├── public/                 # Static assets
├── src/
│   ├── components/         # Modular UI components
│   │   ├── Header.jsx          # Top navigation, live pulse, and search selector
│   │   ├── MetricCard.jsx      # Interactive metric cards
│   │   ├── InteractiveMap.jsx  # Leaflet map with CartoDB tiles
│   │   ├── TrendChart.jsx      # Custom SVG historical trend visualizer
│   │   └── CountryTable.jsx    # Searchable & sortable country rankings
│   ├── services/           # Data layer
│   │   ├── api.js              # Fetch requests with timeout & fallbacks
│   │   └── mockData.js         # Offline resilient dataset
│   ├── utils/              # Formatting utilities
│   │   └── formatters.js       # Number and date formatters
│   ├── App.jsx             # Main dashboard container
│   ├── index.css           # Tailwind & Leaflet custom styling
│   └── main.jsx            # Application entry point
├── index.html              # HTML shell & font preloads
├── package.json            # Project manifest & dependencies
├── tailwind.config.js      # Design tokens
└── vite.config.js          # Vite build config
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- `npm` or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aditya090908/covid19-tracker.git
   cd covid19-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 👤 Author

- **Aditya** — [@Aditya090908](https://github.com/Aditya090908)

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE) — free to use and customize.
