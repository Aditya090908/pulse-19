import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronRight, Terminal, Filter } from 'lucide-react';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';

export default function CountryTable({
  countries,
  selectedCountry,
  onSelectCountry,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('cases'); // 'cases' | 'todayCases' | 'deaths' | 'recovered'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'top10' | 'high_recovery'

  const filteredAndSortedCountries = useMemo(() => {
    let result = countries.filter((c) =>
      c.country.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    if (activeFilter === 'top10') {
      result = [...result].sort((a, b) => (b.cases || 0) - (a.cases || 0)).slice(0, 10);
    } else if (activeFilter === 'high_recovery') {
      result = [...result].filter(
        (c) => c.cases > 100000 && (c.recovered / c.cases) > 0.95
      );
    }

    result.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
    return result;
  }, [countries, searchQuery, sortBy, activeFilter]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 shadow-2xl flex flex-col h-full max-h-[660px]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <h3 className="font-mono font-bold text-sm tracking-wide text-white uppercase">
              TERRITORY SURVEILLANCE
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
            {filteredAndSortedCountries.length} NODES
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400/60" />
          <input
            type="text"
            placeholder="Search territory or ISO code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/90 border border-cyan-500/30 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
          />
        </div>

        {/* Filter Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono">
          <span className="text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" />
          </span>
          {[
            { id: 'all', label: 'ALL' },
            { id: 'top10', label: 'TOP 10' },
            { id: 'high_recovery', label: '>95% REC' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-2 py-0.5 rounded transition-all whitespace-nowrap ${
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

      {/* Sort Buttons Row */}
      <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-800/80 text-[10px] font-mono overflow-x-auto">
        <span className="text-slate-500 flex items-center gap-1 mr-1">
          <ArrowUpDown className="h-3 w-3" /> SORT:
        </span>
        {[
          { key: 'cases', label: 'CASES' },
          { key: 'todayCases', label: '+24H' },
          { key: 'recovered', label: 'REC' },
          { key: 'deaths', label: 'DEATHS' },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setSortBy(btn.key)}
            className={`px-2 py-0.5 rounded font-mono transition-all whitespace-nowrap ${
              sortBy === btn.key
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                : 'text-slate-500 hover:text-slate-300 bg-slate-950/40'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Scrollable Node List */}
      <div className="overflow-y-auto flex-1 mt-2 space-y-1.5 pr-1 divide-y divide-slate-800/40">
        {filteredAndSortedCountries.map((country, index) => {
          const isSelected =
            selectedCountry &&
            (selectedCountry.toLowerCase() === country.country.toLowerCase() ||
              selectedCountry.toLowerCase() === country.countryInfo?.iso2?.toLowerCase());

          const recoveryRate = country.cases > 0
            ? ((country.recovered / country.cases) * 100).toFixed(0)
            : 0;

          return (
            <div
              key={country.country}
              onClick={() => onSelectCountry(country.countryInfo?.iso2 || country.country)}
              role="button"
              tabIndex={0}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? 'bg-cyan-950/60 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'hover:bg-slate-950/60 border border-transparent hover:border-cyan-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-mono text-cyan-500/70 w-6 text-right">
                  #{String(index + 1).padStart(2, '0')}
                </span>
                <img
                  src={country.countryInfo?.flag}
                  alt={country.country}
                  className="h-3.5 w-5 object-cover rounded shadow border border-slate-700/60 flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                    {country.country.toUpperCase()}
                  </p>
                  {/* Miniature Recovery Bar */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-12 bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full"
                        style={{ width: `${Math.min(recoveryRate, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">
                      {recoveryRate}% rec
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center gap-2 font-mono">
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

        {filteredAndSortedCountries.length === 0 && (
          <div className="text-center py-8 font-mono text-xs text-slate-500">
            NO MATCHING NODES LOCATED
          </div>
        )}
      </div>
    </div>
  );
}
