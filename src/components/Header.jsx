import React from 'react';
import { Radio, Globe, Github, RefreshCw, Cpu } from 'lucide-react';
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
    <header className="border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-300/30">
            <Radio className="h-6 w-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-300"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                PULSE<span className="text-cyan-400">19</span>
                <span className="text-xs text-slate-400 font-sans font-normal border border-slate-800 px-1.5 py-0.5 rounded bg-slate-900/60">
                  OBSERVATORY
                </span>
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-md border ${
                isLive
                  ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-amber-950/80 text-amber-400 border-amber-500/40'
              } flex items-center gap-1.5`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-cyan-400 animate-ping' : 'bg-amber-400'}`}></span>
                {isLive ? 'LIVE TELEMETRY' : 'CACHED FEED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>SYNC: {formatDate(lastUpdated)}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Feed"
            className="p-2.5 rounded-xl border border-cyan-500/30 bg-slate-900/70 hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 transition-all disabled:opacity-50 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Futuristic Country Selector */}
          <div className="relative min-w-[210px] flex-1 sm:flex-initial">
            <select
              value={selectedCountry}
              onChange={(e) => onSelectCountry(e.target.value)}
              className="w-full appearance-none bg-slate-900/90 border border-cyan-500/30 text-slate-100 text-xs font-mono rounded-xl pl-9 pr-8 py-2.5 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 transition-all cursor-pointer shadow-inner"
            >
              <option value="worldwide">🌐 WORLDWIDE TELEMETRY</option>
              {countries.map((c) => (
                <option key={c.country} value={c.countryInfo.iso2 || c.country}>
                  {c.country.toUpperCase()}
                </option>
              ))}
            </select>
            <Globe className="absolute left-3 top-3 h-4 w-4 text-cyan-400 pointer-events-none" />
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com/Aditya090908/covid19-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl border border-cyan-500/20 bg-slate-900/60 hover:bg-cyan-950/40 hover:border-cyan-400/50 text-xs font-mono text-cyan-300 transition-all shadow-sm"
          >
            <Github className="h-4 w-4" />
            <span>@Aditya090908</span>
          </a>
        </div>
      </div>
    </header>
  );
}
