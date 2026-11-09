import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronRight, Globe2 } from 'lucide-react';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';

export default function CountryTable({
  countries,
  selectedCountry,
  onSelectCountry,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('cases'); // 'cases' | 'todayCases' | 'deaths' | 'recovered'

  const filteredAndSortedCountries = useMemo(() => {
    let result = countries.filter((c) =>
      c.country.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    result.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
    return result;
  }, [countries, searchQuery, sortBy]);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full max-h-[640px]">
      {/* Header & Search */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-rose-500" />
            <h3 className="font-bold text-base text-white">Live Country Rankings</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredAndSortedCountries.length} countries
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-colors"
          />
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex items-center gap-1.5 pb-3 border-b border-slate-800 text-[11px] overflow-x-auto">
        <span className="text-slate-500 flex items-center gap-1 mr-1">
          <ArrowUpDown className="h-3 w-3" /> Sort:
        </span>
        {[
          { key: 'cases', label: 'Cases' },
          { key: 'todayCases', label: 'Today' },
          { key: 'deaths', label: 'Deaths' },
          { key: 'recovered', label: 'Recovered' },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setSortBy(btn.key)}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              sortBy === btn.key
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Country List (scrollable) */}
      <div className="overflow-y-auto flex-1 mt-2 space-y-1 pr-1 divide-y divide-slate-800/40">
        {filteredAndSortedCountries.map((country, index) => {
          const isSelected =
            selectedCountry &&
            (selectedCountry.toLowerCase() === country.country.toLowerCase() ||
              selectedCountry.toLowerCase() === country.countryInfo?.iso2?.toLowerCase());

          return (
            <div
              key={country.country}
              onClick={() => onSelectCountry(country.countryInfo?.iso2 || country.country)}
              role="button"
              tabIndex={0}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? 'bg-rose-600/15 border border-rose-500/40'
                  : 'hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[11px] font-mono text-slate-500 w-5 text-right">
                  {index + 1}
                </span>
                <img
                  src={country.countryInfo?.flag}
                  alt={country.country}
                  className="h-4 w-6 object-cover rounded shadow-sm flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                    {country.country}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    +{formatCompactNumber(country.todayCases || 0)} today
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <p className="text-xs font-mono font-bold text-rose-400">
                    {formatCompactNumber(country.cases)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {formatCompactNumber(country.deaths)} deaths
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </div>
            </div>
          );
        })}

        {filteredAndSortedCountries.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500">
            No matching countries found
          </div>
        )}
      </div>
    </div>
  );
}
