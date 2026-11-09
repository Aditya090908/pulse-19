import React from 'react';
import { Radio, Globe, Github, RefreshCw, Bell, Download, Printer, Sun, Moon, Command, ShieldCheck } from 'lucide-react';

export default function Header({
  selectedCountry,
  onSelectCountry,
  countries = [],
  referenceDate = 'October 2024',
  onRefresh,
  loading,
  onOpenCommandPalette,
  onOpenAlerts,
  alertCount = 0,
  onExportCSV,
  onPrintReport,
  isDark,
  onToggleTheme,
}) {
  return (
    <header className="border-b border-cyan-500/20 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-40 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)] font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand / Logo + Demo Badge */}
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
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                PULSE<span className="text-cyan-400">19</span>
                <span className="text-xs text-slate-400 font-sans font-normal border border-slate-800 px-1.5 py-0.5 rounded bg-slate-900/60">
                  OBSERVATORY
                </span>
              </h1>
              {/* Mandatory Demo Label */}
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-950/80 text-amber-300 border border-amber-600/60 flex items-center gap-1 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                DEMO ARCHIVE // ZERO-API
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>REF DATE: {referenceDate} (SIMULATED HISTORICAL BASELINE)</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-end text-xs">
          {/* Ctrl + K Shortcut Button */}
          <button
            onClick={onOpenCommandPalette}
            title="Open Command Palette (Ctrl+K)"
            className="hidden md:flex items-center gap-2 px-2.5 py-2 rounded-xl border border-cyan-500/30 bg-slate-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 transition-all text-xs"
          >
            <Command className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px]">Command Palette</span>
            <kbd className="px-1.5 py-0.5 text-[9px] bg-slate-950 rounded border border-slate-700 text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={onOpenAlerts}
            title="Surveillance Bulletins"
            className="relative p-2 rounded-xl border border-cyan-500/30 bg-slate-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 transition-all"
          >
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {alertCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-xl border border-cyan-500/30 bg-slate-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 transition-all"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-cyan-400" />}
          </button>

          {/* Export PDF Report */}
          <button
            onClick={onPrintReport}
            title="Print or Save PDF Report"
            className="p-2 rounded-xl border border-cyan-500/30 bg-slate-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden lg:inline text-[11px]">PDF</span>
          </button>

          {/* Export CSV Data */}
          <button
            onClick={onExportCSV}
            title="Download Full CSV Dataset"
            className="p-2 rounded-xl border border-cyan-500/30 bg-slate-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline text-[11px]">CSV</span>
          </button>

          {/* Reload Local Dataset simulation */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Reload Local Baseline Data"
            className="p-2 rounded-xl border border-cyan-500/30 bg-slate-900/80 hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Country Selector Dropdown */}
          <div className="relative min-w-[170px] sm:min-w-[190px]">
            <select
              value={selectedCountry}
              onChange={(e) => onSelectCountry(e.target.value)}
              className="w-full appearance-none bg-slate-900/90 border border-cyan-500/30 text-slate-100 text-xs rounded-xl pl-8 pr-7 py-2 hover:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer shadow-inner"
            >
              <option value="worldwide">🌐 WORLDWIDE</option>
              {countries.map((c) => (
                <option key={c.country} value={c.iso2 || c.country}>
                  {c.country.toUpperCase()}
                </option>
              ))}
            </select>
            <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-cyan-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </header>
  );
}
