import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GlobalStatusBar from './components/GlobalStatusBar';
import MetricCard from './components/MetricCard';
import CountryTable from './components/CountryTable';
import TrendChart from './components/TrendChart';
import {
  fetchGlobalStats,
  fetchCountries,
  fetchCountryStats,
  fetchHistoricalData,
} from './services/api';
import { Activity, ShieldCheck, Skull, HeartPulse, Terminal, BarChart2 } from 'lucide-react';
import { formatCompactNumber, formatFullNumber } from './utils/formatters';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState('worldwide');
  const [selectedMetric, setSelectedMetric] = useState('cases'); // 'cases' | 'active' | 'recovered' | 'deaths'
  const [currentStats, setCurrentStats] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [countries, setCountries] = useState([]);
  const [historicalData, setHistoricalData] = useState(null);
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

      setGlobalStats(globalRes.data);
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
      } else {
        const [countryRes, historyRes] = await Promise.all([
          fetchCountryStats(countryCode),
          fetchHistoricalData(countryCode, 60),
        ]);
        const countryData = countryRes.data;
        setCurrentStats(countryData);
        setHistoricalData(historyRes.data);
      }
    } catch (err) {
      console.error('Failed to change country:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeCountryName =
    selectedCountry === 'worldwide'
      ? 'Worldwide Telemetry'
      : currentStats?.country || selectedCountry;

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col bg-tech-grid font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Command Center Navigation */}
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
        {/* Global Telemetry Status Bar */}
        <GlobalStatusBar stats={globalStats} />

        {/* Metric Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            code="01"
            title="Confirmed Influx"
            total={currentStats?.cases}
            today={currentStats?.todayCases}
            type="cases"
            icon={Activity}
            isActive={selectedMetric === 'cases'}
            onClick={() => setSelectedMetric('cases')}
          />
          <MetricCard
            code="02"
            title="Active Load"
            total={currentStats?.active}
            today={currentStats?.critical}
            type="active"
            icon={HeartPulse}
            isActive={selectedMetric === 'active'}
            onClick={() => setSelectedMetric('active')}
          />
          <MetricCard
            code="03"
            title="Full Recoveries"
            total={currentStats?.recovered}
            today={currentStats?.todayRecovered}
            type="recovered"
            icon={ShieldCheck}
            isActive={selectedMetric === 'recovered'}
            onClick={() => setSelectedMetric('recovered')}
          />
          <MetricCard
            code="04"
            title="Total Fatalities"
            total={currentStats?.deaths}
            today={currentStats?.todayDeaths}
            type="deaths"
            icon={Skull}
            isActive={selectedMetric === 'deaths'}
            onClick={() => setSelectedMetric('deaths')}
          />
        </section>

        {/* Two-Column Cockpit Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualizer: Expanded Trajectory Curve + Regional Diagnostics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Historical Trend Chart */}
            <TrendChart
              historicalData={historicalData}
              countryName={activeCountryName}
              activeMetric={selectedMetric}
            />

            {/* Regional Deep Diagnostics Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl space-y-4 font-mono">
              <div className="flex items-center justify-between text-cyan-400 pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    REGIONAL TELEMETRY & DIAGNOSTICS
                  </h4>
                </div>
                <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded">
                  {selectedCountry.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] text-slate-500 uppercase">Critical ICU</p>
                  <p className="font-bold text-amber-400 text-sm mt-1">
                    {formatFullNumber(currentStats?.critical || 0)}
                  </p>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] text-slate-500 uppercase">Tests Conducted</p>
                  <p className="font-bold text-cyan-300 text-sm mt-1">
                    {formatCompactNumber(currentStats?.tests || 0)}
                  </p>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] text-slate-500 uppercase">Density / 1M</p>
                  <p className="font-bold text-slate-200 text-sm mt-1">
                    {formatFullNumber(currentStats?.casesPerOneMillion || 0)}
                  </p>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] text-slate-500 uppercase">Mortality / 1M</p>
                  <p className="font-bold text-rose-400 text-sm mt-1">
                    {formatFullNumber(currentStats?.deathsPerOneMillion || 0)}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">POPULATION:</span>
                  <span className="font-bold text-slate-200">
                    {formatFullNumber(currentStats?.population || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">TESTS / 1M:</span>
                  <span className="font-bold text-cyan-400">
                    {formatFullNumber(currentStats?.testsPerOneMillion || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Country Rankings Table */}
          <div className="space-y-6">
            <CountryTable
              countries={countries}
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />
          </div>
        </div>
      </main>

      {/* Futuristic Command Center Footer */}
      <footer className="border-t border-cyan-500/20 bg-[#030611] py-6 mt-12 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            ENGINEERED BY{' '}
            <a
              href="https://github.com/Aditya090908"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
            >
              @Aditya090908
            </a>
            . LICENSED UNDER MIT.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://github.com/Aditya090908/covid19-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              SOURCE REPOSITORY
            </a>
            <span>•</span>
            <span className="text-slate-600">PULSE19 OBSERVATORY ENGINE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
