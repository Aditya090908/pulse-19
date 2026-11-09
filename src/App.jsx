import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import GlobalStatusBar from './components/GlobalStatusBar';
import MetricCard from './components/MetricCard';
import WorldMap from './components/WorldMap';
import CountryTable from './components/CountryTable';
import TrendChart from './components/TrendChart';
import CountryDetailModal from './components/CountryDetailModal';
import CommandPalette from './components/CommandPalette';
import AlertsDrawer from './components/AlertsDrawer';
import {
  getGlobalStats,
  getCountries,
  getCountryByCode,
  getAlerts,
} from './services/dataService';
import {
  calculateActiveCases,
  calculateRecoveryPercentage,
  calculateMortalityPercentage,
  calculateCasesPerMillion,
  calculateDeathsPerMillion,
  exportToCSV,
  triggerPrintReport,
  generateRankings,
} from '../src/utils/dataEngine';
import { Activity, ShieldCheck, Skull, HeartPulse, Terminal, Globe, Award, Calendar } from 'lucide-react';
import { formatCompactNumber, formatFullNumber } from './utils/formatters';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState('worldwide');
  const [selectedMetric, setSelectedMetric] = useState('cases'); // 'cases' | 'active' | 'recovered' | 'deaths'
  const [globalStats, setGlobalStats] = useState(null);
  const [countries, setCountries] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Modals & Drawers
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [detailCountry, setDetailCountry] = useState(null);
  const [detailRank, setDetailRank] = useState(null);

  // Load from local single-source-of-truth datasets
  const loadLocalData = useCallback(() => {
    setLoading(true);
    try {
      const gStats = getGlobalStats();
      const cList = getCountries();
      const aList = getAlerts();

      setGlobalStats(gStats);
      setCountries(cList);
      setAlerts(aList);
    } catch (err) {
      console.error('Error reading local datasets:', err);
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  }, []);

  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Active Focus (Worldwide vs Selected Country)
  const currentStats = useMemo(() => {
    if (selectedCountry === 'worldwide') {
      return globalStats;
    }
    const country = getCountryByCode(selectedCountry);
    return country || globalStats;
  }, [selectedCountry, globalStats]);

  const countryRankMap = useMemo(() => {
    return generateRankings(countries, 'cases');
  }, [countries]);

  const activeCountryName =
    selectedCountry === 'worldwide'
      ? 'Worldwide Telemetry'
      : currentStats?.country || selectedCountry;

  // Detail Modal Handler
  const handleOpenDetail = (country, rank = null) => {
    setDetailCountry(country);
    setDetailRank(rank || countryRankMap.get(country.id || country.country) || null);
  };

  const handleSelectCountry = (code) => {
    setSelectedCountry(code);
  };

  const handleExportCSV = () => {
    exportToCSV(countries, `pulse19_surveillance_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark-theme' : 'light-theme'} flex flex-col font-mono selection:bg-cyan-500 selection:text-slate-950`}>
      <div className="bg-tech-grid min-h-screen flex flex-col">
        {/* Top Command Center Header */}
        <Header
          selectedCountry={selectedCountry}
          onSelectCountry={handleSelectCountry}
          countries={countries}
          referenceDate={globalStats?.datasetInfo?.referenceDate || 'October 2024'}
          onRefresh={loadLocalData}
          loading={loading}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          alertCount={alerts.filter((a) => !a.read).length}
          onExportCSV={handleExportCSV}
          onPrintReport={triggerPrintReport}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />

        {/* Printable Executive PDF Report View (Rendered only on print) */}
        <div className="hidden print-only p-8 text-black bg-white">
          <div className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold">PULSE 19 — EXECUTIVE HEALTH INTELLIGENCE ARCHIVE</h1>
            <p className="text-sm text-gray-600">
              Reference Date: {globalStats?.datasetInfo?.referenceDate || 'October 2024'} | Classification: Zero-API Local Audit
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
            <div className="p-3 border border-gray-300">
              <p className="font-bold">Total Confirmed</p>
              <p className="text-lg">{formatFullNumber(globalStats?.cases)}</p>
            </div>
            <div className="p-3 border border-gray-300">
              <p className="font-bold">Total Recovered</p>
              <p className="text-lg">{formatFullNumber(globalStats?.recovered)}</p>
            </div>
            <div className="p-3 border border-gray-300">
              <p className="font-bold">Active Load</p>
              <p className="text-lg">{formatFullNumber(globalStats?.active)}</p>
            </div>
            <div className="p-3 border border-gray-300">
              <p className="font-bold">Total Fatalities</p>
              <p className="text-lg">{formatFullNumber(globalStats?.deaths)}</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Global Status Bar */}
          <GlobalStatusBar stats={globalStats} loading={loading} />

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
              loading={loading}
            />
            <MetricCard
              code="02"
              title="Active Load"
              total={calculateActiveCases(currentStats?.cases, currentStats?.recovered, currentStats?.deaths)}
              today={currentStats?.critical}
              type="active"
              icon={HeartPulse}
              isActive={selectedMetric === 'active'}
              onClick={() => setSelectedMetric('active')}
              loading={loading}
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
              loading={loading}
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
              loading={loading}
            />
          </section>

          {/* Cockpit Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Visualizers Column (Map + Trajectory Curve + Deep Diagnostics) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Interactive World Map (Local SVG Choropleth) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                      INTERACTIVE VECTOR CHOROPLETH MAP
                    </h2>
                  </div>
                  <span className="text-[11px] text-cyan-500/80">
                    CLICK TERRITORY TO OPEN FULL DOSSIER
                  </span>
                </div>

                <WorldMap
                  countries={countries}
                  selectedCountry={selectedCountry}
                  onSelectCountry={handleSelectCountry}
                  onOpenDetail={handleOpenDetail}
                />
              </div>

              {/* Upgraded Trajectory Chart */}
              <TrendChart
                countryName={activeCountryName}
                selectedCountry={selectedCountry}
              />

              {/* Regional Deep Diagnostics Card */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between text-cyan-400 pb-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      TERRITORY TELEMETRY & DIAGNOSTICS
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCountry !== 'worldwide' && currentStats && (
                      <button
                        onClick={() => handleOpenDetail(currentStats)}
                        className="text-[10px] text-cyan-300 hover:text-white bg-cyan-950/80 border border-cyan-700/60 px-2 py-0.5 rounded transition-colors"
                      >
                        VIEW FULL DOSSIER
                      </button>
                    )}
                    <span className="text-[10px] bg-slate-950 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                      {selectedCountry.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                    <p className="text-[10px] text-slate-500 uppercase">Critical ICU</p>
                    <p className="font-bold text-amber-400 text-sm mt-1">
                      {formatFullNumber(currentStats?.critical || 0)}
                    </p>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                    <p className="text-[10px] text-slate-500 uppercase">Diagnostics Tests</p>
                    <p className="font-bold text-cyan-300 text-sm mt-1">
                      {formatCompactNumber(currentStats?.tests || 0)}
                    </p>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                    <p className="text-[10px] text-slate-500 uppercase">Cases / 1M Pop</p>
                    <p className="font-bold text-slate-200 text-sm mt-1">
                      {formatFullNumber(
                        calculateCasesPerMillion(currentStats?.cases, currentStats?.population)
                      )}
                    </p>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                    <p className="text-[10px] text-slate-500 uppercase">Mortality / 1M</p>
                    <p className="font-bold text-rose-400 text-sm mt-1">
                      {formatFullNumber(
                        calculateDeathsPerMillion(currentStats?.deaths, currentStats?.population)
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">POPULATION BASELINE:</span>
                    <span className="font-bold text-slate-200">
                      {formatFullNumber(currentStats?.population || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">RECOVERY RATIO:</span>
                    <span className="font-bold text-emerald-400">
                      {calculateRecoveryPercentage(currentStats?.recovered, currentStats?.cases)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Country Surveillance Table */}
            <div className="space-y-6">
              <CountryTable
                countries={countries}
                selectedCountry={selectedCountry}
                onSelectCountry={handleSelectCountry}
                onOpenDetail={handleOpenDetail}
              />
            </div>
          </div>
        </main>

        {/* Command Palette Modal (Ctrl + K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          countries={countries}
          onSelectCountry={handleSelectCountry}
          onOpenDetail={handleOpenDetail}
          onSelectMetric={setSelectedMetric}
          onExportCSV={handleExportCSV}
          onPrintReport={triggerPrintReport}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          isDark={isDark}
          onOpenAlerts={() => {
            setIsCommandPaletteOpen(false);
            setIsAlertsOpen(true);
          }}
        />

        {/* Alerts & Surveillance Drawer */}
        <AlertsDrawer
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
          alerts={alerts}
        />

        {/* Country Detailed Dossier Modal */}
        <CountryDetailModal
          country={detailCountry}
          isOpen={Boolean(detailCountry)}
          onClose={() => setDetailCountry(null)}
          rank={detailRank}
        />

        {/* Footer */}
        <footer className="border-t border-cyan-500/20 bg-[#030611] py-6 mt-12 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>
              PULSE 19 OBSERVATORY // MAINTAINED BY{' '}
              <a
                href="https://github.com/Aditya090908"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
              >
                @Aditya090908
              </a>
              . DEMO DATA ARCHIVE (OCT 2024).
            </p>
            <div className="flex items-center gap-4 text-[11px]">
              <a
                href="https://github.com/Aditya090908/pulse-19"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                GITHUB REPOSITORY
              </a>
              <span>•</span>
              <span className="text-slate-600">ZERO-API STANDALONE ARCHITECTURE</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
