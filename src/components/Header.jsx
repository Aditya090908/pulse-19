import React from 'react';
import { Activity, Globe, Github, RefreshCw } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function Header({
  selectedCountry,
  onSelectCountry,
  countries,
  lastUpdated,
  isLive,
  onRefresh,
  loading,
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-950/40">
            <Activity className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                COVID-19 <span className="text-rose-500 font-extrabold">TRACKER</span>
              </h1>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                isLive
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                  : 'bg-amber-950/60 text-amber-400 border-amber-800/80'
              } flex items-center gap-1.5`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                {isLive ? 'Live API' : 'Cached Data'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Updated: {formatDate(lastUpdated)}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Data"
            className="p-2.5 rounded-lg border border-slate-800 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Country Selector Dropdown */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <select
              value={selectedCountry}
              onChange={(e) => onSelectCountry(e.target.value)}
              className="w-full appearance-none bg-slate-800 border border-slate-700/80 text-white text-sm rounded-lg pl-9 pr-8 py-2.5 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-colors cursor-pointer"
            >
              <option value="worldwide">🌐 Worldwide</option>
              {countries.map((c) => (
                <option key={c.country} value={c.countryInfo.iso2 || c.country}>
                  {c.country}
                </option>
              ))}
            </select>
            <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/Aditya090908/covid19-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
