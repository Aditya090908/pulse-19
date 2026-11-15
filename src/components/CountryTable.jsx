import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronRight, Terminal, Filter, Download, ExternalLink, HelpCircle } from 'lucide-react';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';
import {
  calculateRecoveryPercentage,
  calculateMortalityPercentage,
  calculateActiveCases,
  sortCountries,
  filterCountries,
  exportToCSV,
} from '../utils/dataEngine';

export default function CountryTable({
  countries = [],
  selectedCountry,
  onSelectCountry,
  onOpenDetail,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('cases'); // 'cases' | 'todayCases' | 'deaths' | 'recovered' | 'recoveryRate'
  const [sortDir, setSortDir] = useState('desc');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'top10' | 'high_recovery' | 'high_mortality'

  const processedCountries = useMemo(() => {
    const filtered = filterCountries(countries, {
      search: searchQuery,
      filterType: activeFilter,
    });

    return sortCountries(filtered, sortBy, sortDir);
  }, [countries, searchQuery, sortBy, sortDir, activeFilter]);

  const handleSortToggle = (key) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    exportToCSV(countries, `pulse19_surveillance_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 shadow-2xl flex flex-col h-full max-h-[660px] font-mono">
      {/* Header & CSV Action */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-sm tracking-wide text-white uppercase">
              TERRITORY SURVEILLANCE
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              title="Export Full Surveillance to CSV"
              className="p-1.5 px-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[11px] text-cyan-300 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <span className="text-[11px] text-cyan-400/80 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded">
              {processedCountries.length} NODES
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400/60" />
          <input
            type="text"
            placeholder="Search country or ISO code (e.g. US, India)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/90 border border-cyan-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
          />
        </div>

        {/* Filter Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
          <span className="text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" />
          </span>
          {[
            { id: 'all', label: 'ALL' },
            { id: 'top10', label: 'TOP 10' },
            { id: 'high_recovery', label: '>95% REC' },
            { id: 'high_mortality', label: '>2% CFR' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Buttons Bar */}
      <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-800/80 text-[10px] overflow-x-auto">
        <span className="text-slate-500 flex items-center gap-1 mr-1">
          <ArrowUpDown className="h-3 w-3" />
        </span>
        {[
          { key: 'cases', label: 'CASES' },
          { key: 'todayCases', label: '+24H' },
          { key: 'recovered', label: 'REC' },
          { key: 'deaths', label: 'DEATHS' },
          { key: 'recoveryRate', label: 'REC %' },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => handleSortToggle(btn.key)}
            className={`px-2 py-0.5 rounded transition-all whitespace-nowrap ${
              sortBy === btn.key
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                : 'text-slate-500 hover:text-slate-300 bg-slate-950/40'
            }`}
          >
            {btn.label} {sortBy === btn.key ? (sortDir === 'desc' ? '↓' : '↑') : ''}
          </button>
        ))}
      </div>

      {/* Scrollable Node List */}
      <div className="overflow-y-auto flex-1 mt-2 space-y-1.5 pr-1 divide-y divide-slate-800/40">
        {processedCountries.map((country, index) => {
          const isSelected =
            selectedCountry &&
            (selectedCountry.toLowerCase() === country.country.toLowerCase() ||
              selectedCountry.toLowerCase() === country.iso2?.toLowerCase());

          const recPct = calculateRecoveryPercentage(country.recovered, country.cases);

          return (
            <div
              key={country.country}
              onClick={() => {
                if (onSelectCountry) onSelectCountry(country.iso2 || country.country);
                if (onOpenDetail) onOpenDetail(country, index + 1);
              }}
              role="button"
              tabIndex={0}
              title="Click to inspect territory dossier"
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? 'bg-cyan-950/70 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'hover:bg-slate-950/70 border border-transparent hover:border-cyan-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] text-cyan-500/70 w-6 text-right font-bold">
                  #{String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-base select-none">{country.flag || '🌐'}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                    {country.country.toUpperCase()}
                  </p>
                  {/* Miniature Recovery Progress */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-14 bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full"
                        style={{ width: `${Math.min(recPct, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] text-slate-400">
                      {recPct}% rec
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <p className="text-xs font-bold text-cyan-400">
                    {formatCompactNumber(country.cases)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    +{formatCompactNumber(country.todayCases || 0)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          );
        })}

        {processedCountries.length === 0 && (
          <div className="text-center py-10 text-xs text-slate-500 space-y-2">
            <HelpCircle className="h-6 w-6 mx-auto text-slate-600" />
            <p>NO TERRITORIES MATCHING CURRENT QUERY</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
