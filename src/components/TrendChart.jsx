import React, { useState, useMemo } from 'react';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';
import { TrendingUp, BarChart2 } from 'lucide-react';

export default function TrendChart({
  historicalData,
  countryName = 'Worldwide',
  activeMetric = 'cases',
}) {
  const [viewMode, setViewMode] = useState('cumulative'); // 'cumulative' | 'daily'
  const [hoverIndex, setHoverIndex] = useState(null);

  const seriesData = useMemo(() => {
    if (!historicalData || !historicalData[activeMetric]) {
      return [];
    }

    const metricTimeline = historicalData[activeMetric];
    const dates = Object.keys(metricTimeline);
    const rawValues = Object.values(metricTimeline);

    if (viewMode === 'cumulative') {
      return dates.map((date, i) => ({
        date,
        value: rawValues[i],
      }));
    } else {
      // Daily difference
      return dates.map((date, i) => {
        if (i === 0) return { date, value: 0 };
        const diff = rawValues[i] - rawValues[i - 1];
        return {
          date,
          value: diff > 0 ? diff : 0,
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

  // SVG Chart Geometry
  const width = 600;
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

  const activeColor = {
    cases: '#f43f5e',
    recovered: '#10b981',
    deaths: '#94a3b8',
    active: '#f59e0b',
  }[activeMetric] || '#3b82f6';

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-rose-500" />
            <h3 className="font-bold text-base text-white">Historical Trends</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {countryName} • {activeMetric.toUpperCase()} ({viewMode})
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
          <button
            onClick={() => setViewMode('cumulative')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              viewMode === 'cumulative'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cumulative
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              viewMode === 'daily'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily New
          </button>
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
                <linearGradient id={`chart-grad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeColor} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={activeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
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
                stroke="#334155"
              />

              {/* Area fill */}
              {points && (
                <polygon
                  points={`${paddingX},${height - paddingY} ${points} ${width - paddingX},${height - paddingY}`}
                  fill={`url(#chart-grad-${activeMetric})`}
                />
              )}

              {/* Sparkline curve */}
              {points && (
                <polyline
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              )}

              {/* Interactive Hover Vertical Line and Circles */}
              {seriesData.map((d, i) => {
                const chartW = width - paddingX * 2;
                const chartH = height - paddingY * 2;
                const x = paddingX + (i / (seriesData.length - 1)) * chartW;
                const normalizedY = (d.value - stats.min) / (stats.max - stats.min);
                const y = height - paddingY - normalizedY * chartH;

                return (
                  <g key={i}>
                    {/* Invisible hit targets */}
                    <rect
                      x={x - (chartW / seriesData.length) / 2}
                      y={0}
                      width={chartW / seriesData.length}
                      height={height}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoverIndex(i)}
                    />
                    {hoverIndex === i && (
                      <>
                        <line
                          x1={x}
                          y1={paddingY}
                          x2={x}
                          y2={height - paddingY}
                          stroke="#64748b"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#ffffff"
                          stroke={activeColor}
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
              <div className="absolute top-2 right-4 bg-slate-950/90 border border-slate-700 px-3 py-1.5 rounded-lg shadow-xl text-xs pointer-events-none backdrop-blur-md">
                <p className="text-slate-400">{seriesData[hoverIndex].date}</p>
                <p className="text-white font-bold">
                  {formatFullNumber(seriesData[hoverIndex].value)} {activeMetric}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
            <BarChart2 className="h-5 w-5 mr-2 opacity-50" />
            No timeline data available for this selection
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Min: {formatCompactNumber(stats.min)}</span>
        <span>Current: {formatCompactNumber(stats.current)}</span>
        <span>Peak: {formatCompactNumber(stats.max)}</span>
      </div>
    </div>
  );
}
