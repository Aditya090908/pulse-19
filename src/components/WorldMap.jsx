import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import * as topojson from 'topojson-client';
import worldData from '../data/world-110m.json';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Activity,
  Layers,
  Eye,
  SlidersHorizontal,
  Compass,
  Radio,
} from 'lucide-react';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';
import {
  calculateActiveCases,
  calculateRecoveryPercentage,
  calculateMortalityPercentage,
  calculateCasesPerMillion,
} from '../utils/dataEngine';

// ISO 3166-1 Numeric ID to ISO2 map for Natural Earth 110m TopoJSON
const ISO_NUMERIC_MAP = {
  '840': 'US',
  '356': 'IN',
  '250': 'FR',
  '276': 'DE',
  '076': 'BR',
  '410': 'KR',
  '392': 'JP',
  '380': 'IT',
  '826': 'GB',
  '643': 'RU',
  '792': 'TR',
  '724': 'ES',
  '036': 'AU',
  '032': 'AR',
  '124': 'CA',
  '710': 'ZA',
  '484': 'MX',
  '818': 'EG',
  '566': 'NG',
  '702': 'SG',
};

const NAME_ALIASES = {
  'United States of America': 'USA',
  'United States': 'USA',
  'United Kingdom': 'UK',
  'Korea': 'South Korea',
  'Dem. Rep. Korea': 'North Korea',
  'Republic of Korea': 'South Korea',
  'Russian Federation': 'Russia',
};

// 4-Tier Infection Heatmap Color Palette
const HEATMAP_COLORS = {
  low: '#0D9488',      // Teal
  moderate: '#00D9F5', // Cyan
  high: '#F59E0B',     // Orange
  critical: '#F43F5E', // Pink/Red
  baseline: '#0B1424', // Non-featured baseline landmass
};

const METRIC_CONFIG = {
  cases: {
    label: 'Confirmed Cases',
    shortLabel: 'Confirmed',
    thresholds: [3_000_000, 15_000_000, 35_000_000],
    labels: ['< 3M', '3M - 15M', '15M - 35M', '> 35M'],
  },
  active: {
    label: 'Active ICU Load',
    shortLabel: 'Active',
    thresholds: [20_000, 80_000, 250_000],
    labels: ['< 20K', '20K - 80K', '80K - 250K', '> 250K'],
  },
  recovered: {
    label: 'Recovered Patients',
    shortLabel: 'Recoveries',
    thresholds: [3_000_000, 15_000_000, 35_000_000],
    labels: ['< 3M', '3M - 15M', '15M - 35M', '> 35M'],
  },
  deaths: {
    label: 'Cumulative Fatalities',
    shortLabel: 'Fatalities',
    thresholds: [30_000, 100_000, 300_000],
    labels: ['< 30K', '30K - 100K', '100K - 300K', '> 300K'],
  },
  casesPerMillion: {
    label: 'Cases / 1M Population',
    shortLabel: 'Density/1M',
    thresholds: [50_000, 150_000, 350_000],
    labels: ['< 50K', '50K - 150K', '150K - 350K', '> 350K'],
  },
};

export default function WorldMap({
  countries = [],
  selectedCountry,
  onSelectCountry,
  onOpenDetail,
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // States
  const [metric, setMetric] = useState('cases');
  const [mapStyle, setMapStyle] = useState('cyber'); // 'cyber' | 'tactical' | 'radar'
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Build Natural Earth GeoJSON and Path Generator
  const { countryFeatures, graticulePath, spherePath, pathGenerator } = useMemo(() => {
    const geojson = topojson.feature(worldData, worldData.objects.countries);
    const projection = geoNaturalEarth1().fitSize([960, 480], geojson);
    const pathGen = geoPath().projection(projection);

    const graticule = geoGraticule10();
    const gratPath = pathGen(graticule);
    const sphPath = pathGen({ type: 'Sphere' });

    return {
      countryFeatures: geojson.features || [],
      graticulePath: gratPath,
      spherePath: sphPath,
      pathGenerator: pathGen,
    };
  }, []);

  // 2. Index local countries for O(1) matching
  const countryMap = useMemo(() => {
    const map = new Map();
    countries.forEach((c) => {
      if (c.iso2) map.set(c.iso2.toUpperCase(), c);
      if (c.iso3) map.set(c.iso3.toUpperCase(), c);
      if (c.country) map.set(c.country.toUpperCase(), c);
    });
    return map;
  }, [countries]);

  // Helper to resolve feature to local country
  const resolveFeatureToCountry = useCallback(
    (feature) => {
      const numericId = String(feature.id).padStart(3, '0');
      const iso2 = ISO_NUMERIC_MAP[numericId] || ISO_NUMERIC_MAP[String(feature.id)];
      if (iso2 && countryMap.has(iso2.toUpperCase())) {
        return countryMap.get(iso2.toUpperCase());
      }

      const name = feature.properties?.name;
      if (name) {
        const alias = NAME_ALIASES[name] || name;
        if (countryMap.has(alias.toUpperCase())) {
          return countryMap.get(alias.toUpperCase());
        }
      }
      return null;
    },
    [countryMap]
  );

  // Calculate country color based on metric intensity
  const getCountryFill = useCallback(
    (country) => {
      if (!country) return HEATMAP_COLORS.baseline;

      let val = 0;
      if (metric === 'cases') val = country.cases || 0;
      else if (metric === 'active') val = calculateActiveCases(country.cases, country.recovered, country.deaths);
      else if (metric === 'recovered') val = country.recovered || 0;
      else if (metric === 'deaths') val = country.deaths || 0;
      else if (metric === 'casesPerMillion') val = calculateCasesPerMillion(country.cases, country.population);

      const [t1, t2, t3] = METRIC_CONFIG[metric].thresholds;

      if (val >= t3) return HEATMAP_COLORS.critical;
      if (val >= t2) return HEATMAP_COLORS.high;
      if (val >= t1) return HEATMAP_COLORS.moderate;
      if (val > 0) return HEATMAP_COLORS.low;
      return HEATMAP_COLORS.baseline;
    },
    [metric]
  );

  // Zoom & Pan Handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.35, 6));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.35, 0.8));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((z) => Math.min(Math.max(z * factor, 0.8), 6));
  };

  // Drag to pan (Mouse)
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Drag & Pan
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Country Click & Hover
  const handleCountryClick = (feature) => {
    const country = resolveFeatureToCountry(feature);
    if (country) {
      if (onSelectCountry) onSelectCountry(country.iso2 || country.country);
      if (onOpenDetail) onOpenDetail(country);
    }
  };

  // Centroid point calculation for selected country marker
  const selectedFeatureCentroid = useMemo(() => {
    if (!selectedCountry || selectedCountry === 'worldwide') return null;
    const target = countryFeatures.find((f) => {
      const c = resolveFeatureToCountry(f);
      return (
        c &&
        (c.country.toLowerCase() === selectedCountry.toLowerCase() ||
          c.iso2?.toLowerCase() === selectedCountry.toLowerCase())
      );
    });
    if (!target) return null;
    return pathGenerator.centroid(target);
  }, [selectedCountry, countryFeatures, resolveFeatureToCountry, pathGenerator]);

  const currentMetricConfig = METRIC_CONFIG[metric] || METRIC_CONFIG.cases;

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-cyan-500/25 bg-[#050B16] shadow-2xl flex flex-col font-mono select-none ${
        isFullscreen ? 'h-screen w-screen p-4 rounded-none' : 'h-[540px] sm:h-[580px]'
      }`}
    >
      {/* 1. Header Toolbar */}
      <div className="z-20 bg-[#0B1424]/90 backdrop-blur-md px-4 py-3 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#00D9F5] animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
              PULSE 19 GLOBAL MAP
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00D9F5]/10 text-[#00D9F5] border border-[#00D9F5]/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D9F5] animate-ping"></span>
            LOCAL GEOGRAPHICAL DATA
          </span>
          <span className="hidden xl:inline text-[11px] text-slate-400">
            Natural Earth 110m Projection // Zero-API Standalone
          </span>
        </div>

        {/* Right Controls Toolbar */}
        <div className="flex items-center gap-2 text-xs">
          {/* Metric Selector */}
          <div className="flex items-center gap-1.5 bg-[#050B16]/90 p-1 px-2 rounded-xl border border-cyan-500/20">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#00D9F5]" />
            <span className="text-[10px] text-slate-400 hidden sm:inline">METRIC:</span>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="bg-transparent text-white text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="cases">Confirmed Cases</option>
              <option value="active">Active ICU Load</option>
              <option value="recovered">Recoveries</option>
              <option value="deaths">Fatalities</option>
              <option value="casesPerMillion">Cases / 1M Pop</option>
            </select>
          </div>

          {/* Map Style Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#050B16]/90 p-1 px-2 rounded-xl border border-cyan-500/20">
            <Layers className="h-3.5 w-3.5 text-[#00AFCB]" />
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
              className="bg-transparent text-white text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="cyber">Cyber Observatory</option>
              <option value="tactical">Tactical Surveillance</option>
              <option value="radar">Deep Ocean Radar</option>
            </select>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-1.5 rounded-xl border border-cyan-500/30 bg-[#050B16]/90 hover:bg-cyan-950/40 text-slate-300 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive SVG Map Surface */}
      <div
        className="w-full flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 960 480"
          className="w-full h-full select-none"
        >
          <defs>
            {/* Subtle Cyan Map Glow Filter */}
            <filter id="border-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00D9F5" floodOpacity="0.75" />
            </filter>

            {/* Ocean Subtle Radial Background */}
            <radialGradient id="ocean-grad" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#0B1424" />
              <stop offset="100%" stopColor="#050B16" />
            </radialGradient>
          </defs>

          {/* Deep Ocean Surface */}
          <rect width="960" height="480" fill="url(#ocean-grad)" />

          {/* World Projection Group with Smooth Zoom & Pan Matrix */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="transition-transform duration-75 ease-out">
            {/* Global Sphere Outline */}
            {spherePath && (
              <path
                d={spherePath}
                fill="none"
                stroke="rgba(0, 217, 245, 0.15)"
                strokeWidth="1"
              />
            )}

            {/* Subtle Latitude & Longitude Graticule Lines */}
            {graticulePath && (
              <path
                d={graticulePath}
                fill="none"
                stroke="rgba(0, 217, 245, 0.05)"
                strokeWidth="0.5"
                strokeDasharray="2,3"
              />
            )}

            {/* Real Geographical Country Boundaries (Natural Earth 110m) */}
            {countryFeatures.map((feature, idx) => {
              const country = resolveFeatureToCountry(feature);
              const pathD = pathGenerator(feature);
              if (!pathD) return null;

              const isSelected =
                country &&
                selectedCountry &&
                (country.country.toLowerCase() === selectedCountry.toLowerCase() ||
                  country.iso2?.toLowerCase() === selectedCountry.toLowerCase());

              const isHovered = hoveredCountry?.featureId === feature.id;
              const fill = getCountryFill(country);

              return (
                <path
                  key={feature.id || idx}
                  d={pathD}
                  fill={fill}
                  stroke={
                    isSelected
                      ? '#00D9F5'
                      : isHovered
                      ? '#00D9F5'
                      : 'rgba(255, 255, 255, 0.12)'
                  }
                  strokeWidth={isSelected || isHovered ? 1.6 / zoom : 0.6 / zoom}
                  filter={isSelected || isHovered ? 'url(#border-glow)' : 'none'}
                  className="transition-colors duration-200 cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredCountry({
                      featureId: feature.id,
                      name: feature.properties?.name || 'Uncharted Territory',
                      country,
                    });
                  }}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCountryClick(feature);
                  }}
                />
              );
            })}

            {/* Selected Country Location Marker & Pulsing Radar Halo */}
            {selectedFeatureCentroid && !isNaN(selectedFeatureCentroid[0]) && (
              <g transform={`translate(${selectedFeatureCentroid[0]}, ${selectedFeatureCentroid[1]})`}>
                <circle r={9 / zoom} fill="none" stroke="#00D9F5" strokeWidth={1.5 / zoom} className="animate-ping" opacity="0.6" />
                <circle r={4 / zoom} fill="#00D9F5" stroke="#ffffff" strokeWidth={1 / zoom} />
              </g>
            )}
          </g>
        </svg>

        {/* Subtle Horizontal Animated Scanning Line */}
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D9F5]/40 to-transparent pointer-events-none animate-scanline" />

        {/* Floating Zoom & Pan Control Panel (Top-Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-[#0B1424]/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/30 shadow-2xl">
          <button
            onClick={handleZoomIn}
            title="Zoom In (or use Mouse Wheel)"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-500/20 transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-500/20 transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset View Orientation"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-500/20 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Interactive Floating Hover Tooltip */}
        {hoveredCountry && (
          <div
            className="absolute z-30 pointer-events-none bg-[#050B16]/95 border border-[#00D9F5]/50 p-3.5 rounded-xl shadow-2xl backdrop-blur-md min-w-[220px] max-w-[280px] text-xs transform -translate-x-1/2 -translate-y-full transition-all"
            style={{
              left: `${Math.max(120, Math.min(tooltipPos.x, (containerRef.current?.clientWidth || 960) - 120))}px`,
              top: `${Math.max(20, tooltipPos.y - 12)}px`,
            }}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30">
              <div className="flex items-center gap-2">
                <span className="text-base select-none">
                  {hoveredCountry.country?.flag || '🌐'}
                </span>
                <span className="font-bold text-white uppercase text-sm truncate">
                  {hoveredCountry.country?.country || hoveredCountry.name}
                </span>
              </div>
              <span className="text-[10px] bg-cyan-950 text-[#00D9F5] px-1.5 py-0.5 rounded border border-cyan-800">
                {hoveredCountry.country?.iso2 || 'GEO'}
              </span>
            </div>

            {hoveredCountry.country ? (
              <div className="space-y-1.5 text-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-400">Confirmed:</span>
                  <span className="font-bold text-white">
                    {formatFullNumber(hoveredCountry.country.cases)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400">Active Load:</span>
                  <span className="font-bold">
                    {formatFullNumber(
                      calculateActiveCases(
                        hoveredCountry.country.cases,
                        hoveredCountry.country.recovered,
                        hoveredCountry.country.deaths
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Recoveries:</span>
                  <span className="font-bold">
                    {formatFullNumber(hoveredCountry.country.recovered)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-400">Fatalities:</span>
                  <span className="font-bold">
                    {formatFullNumber(hoveredCountry.country.deaths)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                  <span>Cases / 1M:</span>
                  <span className="font-bold text-cyan-300">
                    {formatFullNumber(
                      calculateCasesPerMillion(
                        hoveredCountry.country.cases,
                        hoveredCountry.country.population
                      )
                    )}
                  </span>
                </div>
                <div className="pt-2 text-[10px] text-[#00D9F5] flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3" /> Click to open detailed dossier
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p>Monitored Baseline Territory</p>
                <p className="text-[10px] text-slate-500">
                  Select a featured territory for detailed telemetry.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Gradient Legend & Projection Meta */}
      <div className="bg-[#0B1424]/90 border-t border-cyan-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Metric Label */}
        <div className="flex items-center gap-2 text-slate-300">
          <Activity className="h-3.5 w-3.5 text-[#00D9F5]" />
          <span className="font-bold text-white uppercase">{currentMetricConfig.label}</span>
          <span className="text-[11px] text-slate-400">INTENSITY SCALE:</span>
        </div>

        {/* 4-Tier Clean Gradient Legend Chips */}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#0D9488] shadow-sm"></span>
            <span className="text-slate-300 text-[11px] font-bold">
              {currentMetricConfig.labels[0]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#00D9F5] shadow-sm"></span>
            <span className="text-slate-300 text-[11px] font-bold">
              {currentMetricConfig.labels[1]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#F59E0B] shadow-sm"></span>
            <span className="text-slate-300 text-[11px] font-bold">
              {currentMetricConfig.labels[2]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#F43F5E] shadow-sm"></span>
            <span className="text-slate-300 text-[11px] font-bold">
              {currentMetricConfig.labels[3]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
