import React from 'react';
import { ShieldAlert, Crosshair, HeartPulse, Activity } from 'lucide-react';

export default function GlobalStatusBar({ stats }) {
  if (!stats) return null;

  const totalCases = stats.cases || 1;
  const totalRecovered = stats.recovered || 0;
  const totalDeaths = stats.deaths || 0;
  const activeCases = stats.active || 1;
  const criticalCases = stats.critical || 0;

  const recoveryRate = ((totalRecovered / totalCases) * 100).toFixed(2);
  const fatalityRate = ((totalDeaths / totalCases) * 100).toFixed(2);
  const criticalRate = ((criticalCases / activeCases) * 100).toFixed(2);

  return (
    <section className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Bio-Surveillance Status Indicator */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                BIO-INTELLIGENCE TELEMETRY
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                FEED ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live algorithmic surveillance across {stats.affectedCountries || '230+'} territories
            </p>
          </div>
        </div>

        {/* Right: Key Ratios */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full lg:w-auto">
          {/* Recovery Ratio */}
          <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-2.5 px-3 min-w-[120px]">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono text-emerald-400">
                <HeartPulse className="h-3 w-3" /> RECOVERY
              </span>
              <span className="text-emerald-400 font-bold">{recoveryRate}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                style={{ width: `${Math.min(recoveryRate, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Fatality Ratio */}
          <div className="bg-slate-950/70 border border-rose-500/20 rounded-xl p-2.5 px-3 min-w-[120px]">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono text-rose-400">
                <ShieldAlert className="h-3 w-3" /> LETHALITY
              </span>
              <span className="text-rose-400 font-bold">{fatalityRate}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                style={{ width: `${Math.min(fatalityRate * 10, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* ICU Severity Ratio */}
          <div className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-2.5 px-3 min-w-[120px]">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono text-amber-400">
                <Crosshair className="h-3 w-3" /> ICU INDEX
              </span>
              <span className="text-amber-400 font-bold">{criticalRate}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                style={{ width: `${Math.min(criticalRate * 20, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
