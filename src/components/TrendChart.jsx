import React, { useState, useMemo } from 'react';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';
import { LineChart, Calendar, Layers, Activity, ShieldCheck, Skull } from 'lucide-react';
import historicalStats from '../data/historical-stats.json';

export default function TrendChart({
  countryName = 'Worldwide',
  selectedCountry = 'worldwide',
}) {
  const [viewMode, setViewMode] = useState('cumulative'); // 'cumulative' | 'daily'
  const [timeframe, setTimeframe] = useState('30d');       // '7d' | '30d' | '90d' | 'all'
  const [activeMetric, setActiveMetric] = useState('cases'); // 'cases' | 'recovered' | 'deaths'
  const [compareMode, setCompareMode] = useState(false);    // Overlays recovered curve
  const [hoverIndex, setHoverIndex] = useState(null);

  // Retrieve timeframe data from local dataset
  const seriesData = useMemo(() => {
    const tf = timeframe.toLowerCase();
    const timeline = historicalStats.worldwide[tf] || historicalStats.worldwide['30d'];

    const dates = timeline.dates || [];
    const rawCases = timeline.cases || [];
    const rawDeaths = timeline.deaths || [];
    const rawRecovered = timeline.recovered || [];

    const getMetricArray = (m) => {
      if (m === 'deaths') return rawDeaths;
      if (m === 'recovered') return rawRecovered;
      return rawCases;
    };

    const mainArray = getMetricArray(activeMetric);

    if (viewMode === 'cumulative') {
      return dates.map((date, i) => ({
        date,
        value: mainArray[i] || 0,
        recovered: rawRecovered[i] || 0,
      }));
    } else {
      // Daily Influx Delta
      return dates.map((date, i) => {
        if (i === 0) return { date, value: 0, recovered: 0 };
        const diff = (mainArray[i] || 0) - (mainArray[i - 1] || 0);
        const recDiff = (rawRecovered[i] || 0) - (rawRecovered[i - 1] || 0);
        return {
          date,
          value: diff > 0 ? diff : 0,
          recovered: recDiff > 0 ? recDiff : 0,
        };
      });
    }
  }, [timeframe, activeMetric, viewMode]);

  const stats = useMemo(() => {
    if (seriesData.length === 0) return { min: 0, max: 1, current: 0 };
    const values = seriesData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = values[values.length - 1];
    return { min, max: max === min ? min + 1 : max, current };
  }, [seriesData]);

  // Chart Dimensions
  const width = 640;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;

  const points = useMemo(() => {
    if (seriesData.length <= 1) return '';
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    return seriesData
      .map((d, i) => {
        const x = paddingX + (i / (seriesData.length - 1)) * chartW;
        const normalizedY = (d.value - stats.min) / (stats.max - stats.min);
        const y = height - paddingY - normalizedY * chartH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [seriesData, stats]);

  const recoveredPoints = useMemo(() => {
    if (!compareMode || seriesData.length <= 1) return '';
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    return seriesData
      .map((d, i) => {
        const x = paddingX + (i / (seriesData.length - 1)) * chartW;
        const normalizedY = (d.recovered - stats.min) / (stats.max - stats.min);
        const y = height - paddingY - normalizedY * chartH;
        return `${x.toFixed(1)},${Math.max(paddingY, Math.min(height - paddingY, y)).toFixed(1)}`;
      })
      .join(' ');
  }, [seriesData, stats, compareMode]);

  const metricTheme = {
    cases: { stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' },
    recovered: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
    deaths: { stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.5)' },
  }[activeMetric] || { stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden font-mono">
      {/* Top Header & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-sm tracking-wide text-white uppercase">
              EPIDEMIOLOGICAL TRAJECTORY
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              LOCAL ARCHIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            NODE: {countryName.toUpperCase()} // TIMEFRAME: {timeframe.toUpperCase()}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'cases', label: 'CASES', icon: Activity },
              { id: 'recovered', label: 'RECOVERED', icon: ShieldCheck },
              { id: 'deaths', label: 'DEATHS', icon: Skull },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeMetric === m.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Timeframe Selector Tabs */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'all', label: 'ALL' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeframe === tf.id
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Compare Toggle */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-2.5 py-1 rounded-xl text-xs border transition-all flex items-center gap-1.5 ${
              compareMode
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>+ COMPARE REC</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-2 py-1 rounded-lg transition-all ${
                viewMode === 'cumulative'
                  ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              CUMULATIVE
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-2 py-1 rounded-lg transition-all ${
                viewMode === 'daily'
                  ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              DAILY DELTA
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden">
        {seriesData.length > 0 ? (
          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-52 sm:h-60 overflow-visible"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="chart-neon-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricTheme.stroke} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={metricTheme.stroke} stopOpacity="0.0" />
                </linearGradient>
                <filter id="svg-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={metricTheme.stroke} floodOpacity="0.75" />
                </filter>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#1e293b" strokeDasharray="4 4" />
              <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#1e293b" strokeDasharray="4 4" />
              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#0891b2" strokeOpacity="0.4" />

              {/* Area Fill */}
              {points && (
                <polygon
                  points={`${paddingX},${height - paddingY} ${points} ${width - paddingX},${height - paddingY}`}
                  fill="url(#chart-neon-grad)"
                />
              )}

              {/* Comparison Curve */}
              {recoveredPoints && (
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points={recoveredPoints}
                />
              )}

              {/* Main Metric Curve */}
              {points && (
                <polyline
                  fill="none"
                  stroke={metricTheme.stroke}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#svg-neon-glow)"
                  points={points}
                />
              )}

              {/* Hover Interactivity */}
              {seriesData.map((d, i) => {
                const chartW = width - paddingX * 2;
                const chartH = height - paddingY * 2;
                const x = paddingX + (i / (seriesData.length - 1)) * chartW;
                const normalizedY = (d.value - stats.min) / (stats.max - stats.min);
                const y = height - paddingY - normalizedY * chartH;

                return (
                  <g key={i}>
                    <rect
                      x={x - (chartW / seriesData.length) / 2}
                      y={0}
                      width={chartW / seriesData.length}
                      height={height}
                      fill="transparent"
                      className="cursor-crosshair"
                      onMouseEnter={() => setHoverIndex(i)}
                    />
                    {hoverIndex === i && (
                      <>
                        <line
                          x1={x}
                          y1={paddingY}
                          x2={x}
                          y2={height - paddingY}
                          stroke="#22d3ee"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="5.5"
                          fill="#ffffff"
                          stroke={metricTheme.stroke}
                          strokeWidth="3"
                        />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Popup */}
            {hoverIndex !== null && seriesData[hoverIndex] && (
              <div className="absolute top-2 right-4 bg-slate-950/95 border border-cyan-500/40 p-3 rounded-xl shadow-2xl text-xs pointer-events-none backdrop-blur-md min-w-[190px]">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] text-slate-400">
                  <span>TIMESTAMP</span>
                  <span className="text-cyan-400 font-bold">{seriesData[hoverIndex].date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 uppercase">{activeMetric}:</span>
                  <span className="font-bold text-white text-sm">
                    {formatFullNumber(seriesData[hoverIndex].value)}
                  </span>
                </div>
                {compareMode && (
                  <div className="flex items-center justify-between mt-1 text-emerald-400 text-xs">
                    <span>RECOVERED:</span>
                    <span className="font-bold">
                      {formatFullNumber(seriesData[hoverIndex].recovered)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
            NO TIMELINE TELEMETRY FOUND IN ARCHIVE
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>MIN: {formatCompactNumber(stats.min)}</span>
        <span className="text-cyan-400 font-bold">CURRENT: {formatCompactNumber(stats.current)}</span>
        <span>PEAK: {formatCompactNumber(stats.max)}</span>
      </div>
    </div>
  );
}
