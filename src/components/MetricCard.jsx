import React from 'react';
import { formatCompactNumber, formatFullNumber, formatStatChange } from '../utils/formatters';

export default function MetricCard({
  title,
  total,
  today,
  type,
  icon: Icon,
  isActive,
  onClick,
}) {
  const colorStyles = {
    cases: {
      activeBorder: 'border-rose-500 shadow-rose-950/40',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      iconBg: 'bg-rose-500/10 text-rose-400',
      textAccent: 'text-rose-400',
      dot: 'bg-rose-500',
    },
    recovered: {
      activeBorder: 'border-emerald-500 shadow-emerald-950/40',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      textAccent: 'text-emerald-400',
      dot: 'bg-emerald-500',
    },
    deaths: {
      activeBorder: 'border-slate-400 shadow-slate-900/50',
      badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      iconBg: 'bg-slate-500/10 text-slate-300',
      textAccent: 'text-slate-300',
      dot: 'bg-slate-400',
    },
    active: {
      activeBorder: 'border-amber-500 shadow-amber-950/40',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-400',
      textAccent: 'text-amber-400',
      dot: 'bg-amber-500',
    },
  }[type] || {
    activeBorder: 'border-indigo-500 shadow-indigo-950/40',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    iconBg: 'bg-indigo-500/10 text-indigo-400',
    textAccent: 'text-indigo-400',
    dot: 'bg-indigo-500',
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-left select-none bg-slate-900/70 hover:bg-slate-800/80 shadow-lg ${
        isActive
          ? `${colorStyles.activeBorder} ring-2 ring-opacity-60 ring-offset-2 ring-offset-slate-950 shadow-xl`
          : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${colorStyles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Main stat */}
      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white" title={formatFullNumber(total)}>
          {formatCompactNumber(total)}
        </h3>
        <p className="text-xs text-slate-500 truncate">
          {formatFullNumber(total)} total recorded
        </p>
      </div>

      {/* Bottom badge */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-400">24h Change:</span>
        <span className={`px-2 py-0.5 rounded-md font-semibold border ${colorStyles.badge}`}>
          {formatStatChange(today)}
        </span>
      </div>

      {/* Selected Indicator Pill */}
      {isActive && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <span className={`inline-block w-6 h-6 rounded-full ${colorStyles.dot} opacity-20 blur-sm`}></span>
        </div>
      )}
    </div>
  );
}
