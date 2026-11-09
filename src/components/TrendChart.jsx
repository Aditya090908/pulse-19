import React, { useState, useMemo } from 'react';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';
import { LineChart, BarChart3, Layers, Crosshair } from 'lucide-react';

export default function TrendChart({
  historicalData,
  countryName = 'Worldwide',
  activeMetric = 'cases',
}) {
  const [viewMode, setViewMode] = useState('cumulative'); // 'cumulative' | 'daily'
  const [compareMode, setCompareMode] = useState(false); // overlay cases vs recovered
  const [hoverIndex, setHoverIndex] = useState(null);

  const seriesData = useMemo(() => {
    if (!historicalData || !historicalData[activeMetric]) {
      return [];
    }

    const metricTimeline = historicalData[activeMetric];
    const recoveredTimeline = historicalData.recovered || {};
    const dates = Object.keys(metricTimeline);
    const rawValues = Object.values(metricTimeline);
    const rawRecovered = Object.values(recoveredTimeline);

    if (viewMode === 'cumulative') {
      return dates.map((date, i) => ({
        date,
        value: rawValues[i],
        recovered: rawRecovered[i] || 0,
      }));
    } else {
      return dates.map((date, i) => {
        if (i === 0) return { date, value: 0, recovered: 0 };
        const diff = rawValues[i] - rawValues[i - 1];
        const recDiff = (rawRecovered[i] || 0) - (rawRecovered[i - 1] || 0);
        return {
          date,
          value: diff > 0 ? diff : 0,
          recovered: recDiff > 0 ? recDiff : 0,
        };
      });
    }
  }, [historicalData, activeMetric, viewMode]);

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
  const paddingX = 40;
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
    active: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
    recovered: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
    deaths: { stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.5)' },
  }[activeMetric] || { stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-cyan-400" />
            <h3 className="font-mono font-bold text-sm tracking-wide text-white uppercase">
              EPIDEMIOLOGICAL TRAJECTORY
            </h3>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            LOCATION: {countryName.toUpperCase()} // METRIC: {activeMetric.toUpperCase()}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Dual compare toggle */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 ${
              compareMode
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>+ RECOVERIES</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'cumulative'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CUMULATIVE
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'daily'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              DAILY INFLUX
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
              className="w-full h-48 sm:h-56 overflow-visible"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="neon-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricTheme.stroke} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={metricTheme.stroke} stopOpacity="0.0" />
                </linearGradient>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={metricTheme.stroke} floodOpacity="0.7" />
                </filter>
              </defs>

              {/* Grid Lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={width - paddingX}
                y2={paddingY}
                stroke="#1e293b"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingX}
                y1={height / 2}
                x2={width - paddingX}
                y2={height / 2}
                stroke="#1e293b"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingX}
                y1={height - paddingY}
                x2={width - paddingX}
                y2={height - paddingY}
                stroke="#0891b2"
                strokeOpacity="0.4"
              />

              {/* Area Fill */}
              {points && (
                <polygon
                  points={`${paddingX},${height - paddingY} ${points} ${width - paddingX},${height - paddingY}`}
                  fill="url(#neon-area-grad)"
                />
              )}

              {/* Comparison Curve for Recoveries */}
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
                  filter="url(#neon-glow)"
                  points={points}
                />
              )}

              {/* Hover Trigger Vertical Columns */}
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
                          r="5"
                          fill="#ffffff"
                          stroke={metricTheme.stroke}
                          strokeWidth="3"
                          className="animate-pulse"
                        />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Floating Telemetry Tooltip */}
            {hoverIndex !== null && seriesData[hoverIndex] && (
              <div className="absolute top-2 right-4 bg-slate-950/95 border border-cyan-500/40 p-2.5 rounded-xl shadow-2xl text-xs font-mono pointer-events-none backdrop-blur-md min-w-[170px]">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800 text-[10px] text-slate-400">
                  <span>TIMESTAMP</span>
                  <span className="text-cyan-400">{seriesData[hoverIndex].date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 uppercase">{activeMetric}:</span>
                  <span className="font-bold text-white">
                    {formatFullNumber(seriesData[hoverIndex].value)}
                  </span>
                </div>
                {compareMode && (
                  <div className="flex items-center justify-between mt-1 text-emerald-400">
                    <span className="text-[11px]">RECOVERED:</span>
                    <span className="font-bold">
                      {formatFullNumber(seriesData[hoverIndex].recovered)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500 font-mono text-xs">
            NO TIMELINE TELEMETRY AVAILABLE
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>MIN: {formatCompactNumber(stats.min)}</span>
        <span className="text-cyan-400 font-bold">CURRENT: {formatCompactNumber(stats.current)}</span>
        <span>PEAK: {formatCompactNumber(stats.max)}</span>
      </div>
    </div>
  );
}
