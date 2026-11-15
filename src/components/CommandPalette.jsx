import React, { useState, useEffect, useMemo } from 'react';
import { Search, Globe, Activity, ShieldCheck, Skull, HeartPulse, Download, Printer, Moon, Sun, Bell, Command, X } from 'lucide-react';
import { formatCompactNumber } from '../utils/formatters';

export default function CommandPalette({
  isOpen,
  onClose,
  countries = [],
  onSelectCountry,
  onOpenDetail,
  onSelectMetric,
  onExportCSV,
  onPrintReport,
  onToggleTheme,
  isDark,
  onOpenAlerts,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults[selectedIndex]) {
          allResults[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const defaultCommands = [
    {
      id: 'cmd-cases',
      category: 'METRICS',
      title: 'Filter Metric: Confirmed Cases',
      subtitle: 'Switch primary visualizer to confirmed cases',
      icon: Activity,
      action: () => onSelectMetric('cases'),
    },
    {
      id: 'cmd-active',
      category: 'METRICS',
      title: 'Filter Metric: Active Cases',
      subtitle: 'Switch primary visualizer to active ICU & hospital load',
      icon: HeartPulse,
      action: () => onSelectMetric('active'),
    },
    {
      id: 'cmd-recovered',
      category: 'METRICS',
      title: 'Filter Metric: Recoveries',
      subtitle: 'Switch primary visualizer to total patient recoveries',
      icon: ShieldCheck,
      action: () => onSelectMetric('recovered'),
    },
    {
      id: 'cmd-deaths',
      category: 'METRICS',
      title: 'Filter Metric: Fatalities',
      subtitle: 'Switch primary visualizer to cumulative mortality',
      icon: Skull,
      action: () => onSelectMetric('deaths'),
    },
    {
      id: 'cmd-csv',
      category: 'ACTIONS',
      title: 'Export Surveillance Data (CSV)',
      subtitle: 'Download full 20-nation local epidemiological dataset',
      icon: Download,
      action: onExportCSV,
    },
    {
      id: 'cmd-pdf',
      category: 'ACTIONS',
      title: 'Export Executive Report (PDF)',
      subtitle: 'Open browser print engine for formatted PDF report',
      icon: Printer,
      action: onPrintReport,
    },
    {
      id: 'cmd-alerts',
      category: 'ACTIONS',
      title: 'View Epidemiological Bulletins & Alerts',
      subtitle: 'Open real-time alert notifications drawer',
      icon: Bell,
      action: onOpenAlerts,
    },
    {
      id: 'cmd-theme',
      category: 'PREFERENCES',
      title: `Switch Theme to ${isDark ? 'Light Observatory' : 'Cyber Obsidian'}`,
      subtitle: 'Toggle dashboard interface theme',
      icon: isDark ? Sun : Moon,
      action: onToggleTheme,
    },
  ];

  const countryResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return countries
      .filter(
        (c) =>
          c.country.toLowerCase().includes(q) ||
          (c.iso2 && c.iso2.toLowerCase().includes(q)) ||
          (c.iso3 && c.iso3.toLowerCase().includes(q))
      )
      .slice(0, 6)
      .map((c) => ({
        id: `country-${c.iso2}`,
        category: 'TERRITORIES',
        title: `${c.flag || '🌐'} ${c.country} (${c.iso2})`,
        subtitle: `${formatCompactNumber(c.cases)} cases • ${formatCompactNumber(c.recovered)} recoveries`,
        icon: Globe,
        action: () => {
          if (onSelectCountry) onSelectCountry(c.iso2 || c.country);
          if (onOpenDetail) onOpenDetail(c);
        },
      }));
  }, [query, countries]);

  const allResults = useMemo(() => {
    if (!query.trim()) return defaultCommands;
    const q = query.toLowerCase().trim();
    const filteredCommands = defaultCommands.filter(
      (c) => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
    );
    return [...countryResults, ...filteredCommands];
  }, [query, countryResults]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden font-mono">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-cyan-500/20 bg-slate-950/90">
          <Search className="h-4 w-4 text-cyan-400 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or territory name (e.g. USA, CSV, Cases)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {allResults.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      isSelected ? 'border-slate-900 bg-slate-900 text-cyan-400' : 'border-slate-800 bg-slate-950 text-cyan-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs truncate">{item.title}</p>
                    <p
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                    isSelected
                      ? 'border-slate-900 text-slate-900 bg-slate-200'
                      : 'border-slate-800 text-slate-500 bg-slate-950'
                  }`}
                >
                  {item.category}
                </span>
              </div>
            );
          })}

          {allResults.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No actions or territories matching "{query}"
            </div>
          )}
        </div>

        {/* Bottom Shortcut Hints */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950 text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>↵ Execute</span>
            <span>•</span>
            <span>Esc Close</span>
          </div>
          <span className="text-cyan-400/80">CTRL + K</span>
        </div>
      </div>
    </div>
  );
}
