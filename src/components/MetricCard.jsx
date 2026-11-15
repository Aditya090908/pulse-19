import React from 'react';
import { formatCompactNumber, formatFullNumber, formatStatChange } from '../utils/formatters';

export default function MetricCard({
  code = '01',
  title,
  total,
  today,
  type,
  icon: Icon,
  isActive,
  onClick,
  loading = false,
}) {
  const themes = {
    cases: {
      borderActive: 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-slate-950',
      tagColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      statColor: 'text-cyan-300',
      progressFill: 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]',
    },
    active: {
      borderActive: 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950',
      tagColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      statColor: 'text-amber-300',
      progressFill: 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]',
    },
    recovered: {
      borderActive: 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950',
      tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      statColor: 'text-emerald-300',
      progressFill: 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]',
    },
    deaths: {
      borderActive: 'border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)] bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-950',
      tagColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      statColor: 'text-rose-300',
      progressFill: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]',
    },
  }[type] || {
    borderActive: 'border-cyan-400',
    tagColor: 'text-cyan-400',
    iconColor: 'text-cyan-400',
    statColor: 'text-cyan-300',
    progressFill: 'bg-cyan-400',
  };

  if (loading) {
    return (
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 animate-pulse space-y-3 font-mono">
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 bg-slate-800 rounded"></div>
          <div className="h-8 w-8 bg-slate-800 rounded-xl"></div>
        </div>
        <div className="h-8 w-32 bg-slate-800 rounded"></div>
        <div className="h-3 w-24 bg-slate-800 rounded"></div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-left select-none backdrop-blur-xl group font-mono ${
        isActive
          ? `${themes.borderActive} ring-1 ring-cyan-400/40`
          : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700'
      }`}
    >
      {/* Top Header Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 tracking-wider">
            [{code}]
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            {title}
          </span>
        </div>
        <div className={`p-2 rounded-xl border ${themes.iconColor} transition-transform group-hover:scale-110 duration-200`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Main Metric Stat */}
      <div className="space-y-1 mb-4">
        <h3 className={`text-3xl font-extrabold tracking-tight ${themes.statColor}`} title={formatFullNumber(total)}>
          {formatCompactNumber(total)}
        </h3>
        <p className="text-[11px] text-slate-500">
          {formatFullNumber(total)} in record
        </p>
      </div>

      {/* 24h Delta Pill & Mini Meter */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          24H INFLUX
        </span>
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${themes.tagColor}`}>
          {formatStatChange(today)}
        </span>
      </div>

      {/* Active Indicator Line */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-[2px]">
          <div className={`h-full w-full ${themes.progressFill}`}></div>
        </div>
      )}
    </div>
  );
}
