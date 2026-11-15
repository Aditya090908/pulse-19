import React from 'react';
import { X, ShieldAlert, HeartPulse, Activity, Skull, Users, Stethoscope, Award, BarChart3 } from 'lucide-react';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';
import {
  calculateActiveCases,
  calculateRecoveryPercentage,
  calculateMortalityPercentage,
  calculateCasesPerMillion,
  calculateDeathsPerMillion,
} from '../utils/dataEngine';

export default function CountryDetailModal({
  country,
  isOpen,
  onClose,
  rank = null,
}) {
  if (!isOpen || !country) return null;

  const activeCases = calculateActiveCases(country.cases, country.recovered, country.deaths);
  const recoveryRate = calculateRecoveryPercentage(country.recovered, country.cases);
  const mortalityRate = calculateMortalityPercentage(country.deaths, country.cases);
  const casesPerMillion = calculateCasesPerMillion(country.cases, country.population);
  const deathsPerMillion = calculateDeathsPerMillion(country.deaths, country.population);

  // Generate a mini 7-day sparkline simulation based on country numbers
  const sparkPoints = [0.82, 0.85, 0.89, 0.93, 0.96, 0.98, 1.0].map((multiplier, idx) => {
    const val = Math.round(country.cases * multiplier);
    return { day: `T-${6 - idx}`, val };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-100 font-mono">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{country.flag || '🌐'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                  {country.country.toUpperCase()}
                </h2>
                <span className="text-xs bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded">
                  {country.iso2} / {country.iso3}
                </span>
                {rank && (
                  <span className="text-xs bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded flex items-center gap-1">
                    <Award className="h-3 w-3" /> RANK #{rank}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                CONTINENT: {country.continent || 'Global'} // POPULATION: {formatFullNumber(country.population)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white hover:border-cyan-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Core Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="bg-slate-950/80 border border-cyan-500/30 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between text-cyan-400 text-xs mb-1">
              <span>CONFIRMED</span>
              <Activity className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold text-white">{formatCompactNumber(country.cases)}</p>
            <p className="text-[10px] text-slate-500">{formatFullNumber(country.cases)} total</p>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/30 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
              <span>ACTIVE</span>
              <HeartPulse className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold text-white">{formatCompactNumber(activeCases)}</p>
            <p className="text-[10px] text-slate-500">{formatFullNumber(activeCases)} current</p>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
              <span>RECOVERED</span>
              <Stethoscope className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold text-white">{formatCompactNumber(country.recovered)}</p>
            <p className="text-[10px] text-slate-500">{formatFullNumber(country.recovered)} total</p>
          </div>

          <div className="bg-slate-950/80 border border-rose-500/30 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
              <span>FATALITIES</span>
              <Skull className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold text-white">{formatCompactNumber(country.deaths)}</p>
            <p className="text-[10px] text-slate-500">{formatFullNumber(country.deaths)} total</p>
          </div>
        </div>

        {/* Secondary Ratios Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs mb-6">
          <div>
            <span className="text-slate-500 text-[10px] block">RECOVERY RATE</span>
            <span className="text-emerald-400 font-bold text-base">{recoveryRate}%</span>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(recoveryRate, 100)}%` }}></div>
            </div>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] block">MORTALITY RATE (CFR)</span>
            <span className="text-rose-400 font-bold text-base">{mortalityRate}%</span>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-rose-500 h-full" style={{ width: `${Math.min(mortalityRate * 10, 100)}%` }}></div>
            </div>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] block">CASES PER 1M</span>
            <span className="text-cyan-300 font-bold text-base">{formatFullNumber(casesPerMillion)}</span>
            <span className="text-[10px] text-slate-500 block mt-1">
              Deaths: {formatFullNumber(deathsPerMillion)}/1M
            </span>
          </div>
        </div>

        {/* Mini Trajectory Preview */}
        <div className="p-4 bg-slate-950/40 rounded-2xl border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1 text-cyan-400">
              <BarChart3 className="h-3.5 w-3.5" /> 7-DAY INFLUX PROGRESSION
            </span>
            <span>+{formatCompactNumber(country.todayCases || 0)} 24H DELTA</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-16 pt-2">
            {sparkPoints.map((pt, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-t shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  style={{ height: `${30 + idx * 8}%` }}
                ></div>
                <span className="text-[9px] text-slate-500">{pt.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 flex items-center justify-between text-[11px] text-slate-500">
          <span>DATA SOURCE: LOCAL DEMO REPOSITORY (OCT 2024)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            DISMISS DOSSIER
          </button>
        </div>
      </div>
    </div>
  );
}
