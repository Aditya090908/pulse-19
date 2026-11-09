import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import InteractiveMap from './components/InteractiveMap';
import CountryTable from './components/CountryTable';
import TrendChart from './components/TrendChart';
import {
  fetchGlobalStats,
  fetchCountries,
  fetchCountryStats,
  fetchHistoricalData,
} from './services/api';
import { Activity, ShieldCheck, Skull, HeartPulse, Info, Globe, AlertTriangle } from 'lucide-react';
import { formatCompactNumber, formatFullNumber } from './utils/formatters';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState('worldwide');
  const [selectedMetric, setSelectedMetric] = useState('cases'); // 'cases' | 'active' | 'recovered' | 'deaths'
  const [currentStats, setCurrentStats] = useState(null);
  const [countries, setCountries] = useState([]);
  const [historicalData, setHistoricalData] = useState(null);
  const [mapCenter, setMapCenter] = useState([25, 10]);
  const [mapZoom, setMapZoom] = useState(2);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);

  // Initial Load: Fetch global stats and countries list
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [globalRes, countriesRes, historyRes] = await Promise.all([
        fetchGlobalStats(),
        fetchCountries(),
        fetchHistoricalData('all', 60),
      ]);

      setCurrentStats(globalRes.data);
      setCountries(countriesRes.data);
      setHistoricalData(historyRes.data);
      setIsLive(globalRes.source === 'live' || countriesRes.source === 'live');
    } catch (err) {
      console.error('Initial data load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle Country Selection
  const handleSelectCountry = async (countryCode) => {
    setSelectedCountry(countryCode);
    setLoading(true);

    try {
      if (countryCode === 'worldwide') {
        const [globalRes, historyRes] = await Promise.all([
          fetchGlobalStats(),
          fetchHistoricalData('all', 60),
        ]);
        setCurrentStats(globalRes.data);
        setHistoricalData(historyRes.data);
        setMapCenter([25, 10]);
        setMapZoom(2);
      } else {
        const [countryRes, historyRes] = await Promise.all([
          fetchCountryStats(countryCode),
          fetchHistoricalData(countryCode, 60),
        ]);
        const countryData = countryRes.data;
        setCurrentStats(countryData);
        setHistoricalData(historyRes.data);

        if (countryData.countryInfo && countryData.countryInfo.lat && countryData.countryInfo.long) {
          setMapCenter([countryData.countryInfo.lat, countryData.countryInfo.long]);
          setMapZoom(4);
        }
      }
    } catch (err) {
      console.error('Failed to change country:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeCountryName =
    selectedCountry === 'worldwide'
      ? 'Worldwide'
      : currentStats?.country || selectedCountry;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Header
        selectedCountry={selectedCountry}
        onSelectCountry={handleSelectCountry}
        countries={countries}
        lastUpdated={currentStats?.updated}
        isLive={isLive}
        onRefresh={loadInitialData}
        loading={loading}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Coronavirus Cases"
            total={currentStats?.cases}
            today={currentStats?.todayCases}
            type="cases"
            icon={Activity}
            isActive={selectedMetric === 'cases'}
            onClick={() => setSelectedMetric('cases')}
          />
          <MetricCard
            title="Active Cases"
            total={currentStats?.active}
            today={currentStats?.critical}
            type="active"
            icon={HeartPulse}
            isActive={selectedMetric === 'active'}
            onClick={() => setSelectedMetric('active')}
          />
          <MetricCard
            title="Recovered Patients"
            total={currentStats?.recovered}
            today={currentStats?.todayRecovered}
            type="recovered"
            icon={ShieldCheck}
            isActive={selectedMetric === 'recovered'}
            onClick={() => setSelectedMetric('recovered')}
          />
          <MetricCard
            title="Total Deaths"
            total={currentStats?.deaths}
            today={currentStats?.todayDeaths}
            type="deaths"
            icon={Skull}
            isActive={selectedMetric === 'deaths'}
            onClick={() => setSelectedMetric('deaths')}
          />
        </section>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Map & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive World Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-rose-500" />
                  <h2 className="text-base font-bold text-white">Interactive Outbreak Map</h2>
                </div>
                <span className="text-xs text-slate-400">
                  Click a bubble to inspect or focus a nation
                </span>
              </div>
              <InteractiveMap
                countries={countries}
                selectedMetric={selectedMetric}
                center={mapCenter}
                zoom={mapZoom}
                onCountrySelect={handleSelectCountry}
              />
            </div>

            {/* Historical Trend Chart */}
            <TrendChart
              historicalData={historicalData}
              countryName={activeCountryName}
              activeMetric={selectedMetric}
            />
          </div>

          {/* Right Column: Country Rankings Table & Quick Stats */}
          <div className="space-y-6">
            <CountryTable
              countries={countries}
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />

            {/* Quick Insights Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Info className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Region Highlights ({activeCountryName})
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-slate-500">Critical ICU</p>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {formatFullNumber(currentStats?.critical || 0)}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-slate-500">Tests Performed</p>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {formatCompactNumber(currentStats?.tests || 0)}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-slate-500">Cases / 1M</p>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {formatFullNumber(currentStats?.casesPerOneMillion || 0)}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-slate-500">Deaths / 1M</p>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {formatFullNumber(currentStats?.deathsPerOneMillion || 0)}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                Data refreshed dynamically via public health repositories with automatic failover.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Developed by{' '}
            <a
              href="https://github.com/Aditya090908"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 hover:text-white underline underline-offset-4"
            >
              Aditya090908
            </a>
            . Licensed under MIT.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Aditya090908/covid19-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <span className="text-slate-600">Built with React, Vite & Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
