import React, { useState, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Info, Layers, Eye } from 'lucide-react';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';
import { calculateRecoveryPercentage } from '../utils/dataEngine';

// Simplified high-fidelity SVG paths for world landmasses and key epidemiological territories
const REGIONS = [
  // North America
  {
    code: 'USA',
    iso2: 'US',
    name: 'USA',
    d: 'M 140,115 L 230,115 L 245,140 L 235,185 L 180,185 L 140,150 Z M 80,60 L 130,55 L 120,95 L 85,90 Z',
    labelX: 185,
    labelY: 150,
  },
  {
    code: 'CAN',
    iso2: 'CA',
    name: 'Canada',
    d: 'M 130,55 L 245,50 L 260,85 L 230,115 L 140,115 L 130,95 Z',
    labelX: 180,
    labelY: 85,
  },
  {
    code: 'MEX',
    iso2: 'MX',
    name: 'Mexico',
    d: 'M 145,185 L 195,185 L 210,230 L 175,225 Z',
    labelX: 175,
    labelY: 205,
  },

  // South America
  {
    code: 'BRA',
    iso2: 'BR',
    name: 'Brazil',
    d: 'M 255,250 L 320,260 L 340,305 L 300,360 L 260,330 L 240,280 Z',
    labelX: 290,
    labelY: 300,
  },
  {
    code: 'ARG',
    iso2: 'AR',
    name: 'Argentina',
    d: 'M 250,335 L 285,335 L 275,420 L 255,420 Z',
    labelX: 265,
    labelY: 375,
  },

  // Europe
  {
    code: 'GBR',
    iso2: 'GB',
    name: 'UK',
    d: 'M 430,95 L 445,95 L 440,120 L 428,115 Z',
    labelX: 436,
    labelY: 108,
  },
  {
    code: 'FRA',
    iso2: 'FR',
    name: 'France',
    d: 'M 440,120 L 465,120 L 460,145 L 435,145 Z',
    labelX: 450,
    labelY: 132,
  },
  {
    code: 'DEU',
    iso2: 'DE',
    name: 'Germany',
    d: 'M 465,110 L 490,110 L 488,135 L 465,135 Z',
    labelX: 477,
    labelY: 122,
  },
  {
    code: 'ESP',
    iso2: 'ES',
    name: 'Spain',
    d: 'M 425,145 L 452,145 L 445,170 L 420,165 Z',
    labelX: 435,
    labelY: 155,
  },
  {
    code: 'ITA',
    iso2: 'IT',
    name: 'Italy',
    d: 'M 470,138 L 488,142 L 492,175 L 478,168 Z',
    labelX: 482,
    labelY: 155,
  },
  {
    code: 'RUS',
    iso2: 'RU',
    name: 'Russia',
    d: 'M 500,50 L 780,50 L 760,120 L 580,125 L 495,100 Z',
    labelX: 630,
    labelY: 85,
  },

  // Asia
  {
    code: 'TUR',
    iso2: 'TR',
    name: 'Turkey',
    d: 'M 515,150 L 565,148 L 560,170 L 515,168 Z',
    labelX: 540,
    labelY: 160,
  },
  {
    code: 'IND',
    iso2: 'IN',
    name: 'India',
    d: 'M 605,185 L 660,185 L 645,255 L 618,255 L 600,215 Z',
    labelX: 630,
    labelY: 215,
  },
  {
    code: 'JPN',
    iso2: 'JP',
    name: 'Japan',
    d: 'M 760,150 L 780,155 L 775,185 L 755,180 Z',
    labelX: 768,
    labelY: 168,
  },
  {
    code: 'KOR',
    iso2: 'KR',
    name: 'South Korea',
    d: 'M 725,160 L 745,160 L 742,180 L 725,178 Z',
    labelX: 735,
    labelY: 170,
  },
  {
    code: 'SGP',
    iso2: 'SG',
    name: 'Singapore',
    d: 'M 670,270 L 682,270 L 682,282 L 670,282 Z',
    labelX: 676,
    labelY: 276,
  },

  // Africa
  {
    code: 'EGY',
    iso2: 'EG',
    name: 'Egypt',
    d: 'M 500,180 L 545,180 L 540,215 L 495,215 Z',
    labelX: 520,
    labelY: 198,
  },
  {
    code: 'NGA',
    iso2: 'NG',
    name: 'Nigeria',
    d: 'M 445,240 L 485,240 L 480,275 L 440,275 Z',
    labelX: 462,
    labelY: 258,
  },
  {
    code: 'ZAF',
    iso2: 'ZA',
    name: 'South Africa',
    d: 'M 495,355 L 540,355 L 530,410 L 485,405 Z',
    labelX: 512,
    labelY: 382,
  },

  // Oceania
  {
    code: 'AUS',
    iso2: 'AU',
    name: 'Australia',
    d: 'M 710,310 L 810,315 L 800,395 L 715,385 Z',
    labelX: 760,
    labelY: 350,
  },
];

// Aesthetic choropleth color scale based on case volume
function getIntensityColor(cases) {
  if (!cases || cases === 0) return '#1e293b';
  if (cases >= 35_000_000) return '#f43f5e'; // Critical (Hot Coral / Rose)
  if (cases >= 15_000_000) return '#f59e0b'; // High (Amber)
  if (cases >= 5_000_000) return '#06b6d4';  // Moderate (Electric Cyan)
  return '#0d9488';                          // Low / Contained (Teal)
}

export default function WorldMap({
  countries = [],
  selectedCountry,
  onSelectCountry,
  onOpenDetail,
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Map country statistics by iso2/iso3 for instant O(1) lookup
  const countryStatsMap = useMemo(() => {
    const map = new Map();
    countries.forEach((c) => {
      if (c.iso2) map.set(c.iso2.toUpperCase(), c);
      if (c.iso3) map.set(c.iso3.toUpperCase(), c);
      if (c.country) map.set(c.country.toUpperCase(), c);
    });
    return map;
  }, [countries]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.35, 2.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.35, 0.8));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseMove = (e, region) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredRegion(region);
  };

  const handleRegionClick = (region) => {
    const data = countryStatsMap.get(region.code) || countryStatsMap.get(region.iso2);
    if (data) {
      if (onSelectCountry) onSelectCountry(data.iso2 || data.country);
      if (onOpenDetail) onOpenDetail(data);
    }
  };

  const hoveredData = hoveredRegion
    ? countryStatsMap.get(hoveredRegion.code) || countryStatsMap.get(hoveredRegion.iso2)
    : null;

  return (
    <div className="relative w-full h-[460px] lg:h-[500px] rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950/80 shadow-2xl flex flex-col select-none">
      {/* Top Map HUD Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs font-mono text-cyan-400 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-bold tracking-wider uppercase">LOCAL SVG CHOROPLETH</span>
        </div>
        <div className="hidden sm:flex bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
          ZERO-API // LOCAL VECTORS
        </div>
      </div>

      {/* Zoom / Reset Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/30 shadow-xl">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
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
          title="Reset View"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-500/20 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* SVG Map Canvas */}
      <div className="w-full h-full relative cursor-crosshair overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 950 480"
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          }}
          onMouseLeave={() => setHoveredRegion(null)}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="map-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="0.8" />
            </pattern>
            {/* Glow Filters */}
            <filter id="country-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Technical Grid */}
          <rect width="950" height="480" fill="#030712" />
          <rect width="950" height="480" fill="url(#map-grid)" />

          {/* Global Longitude/Latitude Graticules */}
          <line x1="50" y1="240" x2="900" y2="240" stroke="rgba(255,255,255,0.04)" strokeDasharray="5,5" />
          <line x1="475" y1="40" x2="475" y2="440" stroke="rgba(255,255,255,0.04)" strokeDasharray="5,5" />

          {/* Render Vector Country Boundaries */}
          <g className="transition-all duration-300">
            {REGIONS.map((region) => {
              const countryData = countryStatsMap.get(region.code) || countryStatsMap.get(region.iso2);
              const cases = countryData ? countryData.cases : 0;
              const fillColor = getIntensityColor(cases);
              const isSelected = selectedCountry &&
                (selectedCountry.toLowerCase() === region.name.toLowerCase() ||
                 selectedCountry.toLowerCase() === region.iso2.toLowerCase());
              const isHovered = hoveredRegion?.code === region.code;

              return (
                <g key={region.code} className="cursor-pointer group">
                  <path
                    d={region.d}
                    fill={fillColor}
                    fillOpacity={isHovered ? 0.95 : isSelected ? 0.9 : 0.65}
                    stroke={isSelected ? '#22d3ee' : isHovered ? '#00f0ff' : 'rgba(255,255,255,0.18)'}
                    strokeWidth={isSelected || isHovered ? 2.5 : 1.2}
                    filter={isSelected || isHovered ? 'url(#country-glow)' : 'none'}
                    className="transition-all duration-200"
                    onMouseMove={(e) => handleMouseMove(e, region)}
                    onClick={() => handleRegionClick(region)}
                  />

                  {/* Pulsing beacon marker on territory centroid */}
                  <circle
                    cx={region.labelX}
                    cy={region.labelY}
                    r={isHovered ? 4.5 : 2.5}
                    fill={isHovered ? '#ffffff' : '#06b6d4'}
                    className="pointer-events-none transition-all"
                  />
                  {isSelected && (
                    <circle
                      cx={region.labelX}
                      cy={region.labelY}
                      r="9"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                      className="animate-spin pointer-events-none"
                    />
                  )}

                  {/* Text code label */}
                  <text
                    x={region.labelX}
                    y={region.labelY - 7}
                    textAnchor="middle"
                    fill={isHovered ? '#ffffff' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="pointer-events-none select-none transition-colors"
                  >
                    {region.iso2}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredRegion && hoveredData && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-950/95 border border-cyan-500/50 p-3 rounded-xl shadow-2xl backdrop-blur-md min-w-[210px] font-mono text-xs transition-all transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${Math.max(110, Math.min(tooltipPos.x, 840))}px`,
              top: `${Math.max(15, tooltipPos.y - 12)}px`,
            }}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30">
              <div className="flex items-center gap-2">
                <span className="text-base">{hoveredData.flag || '🌐'}</span>
                <span className="font-bold text-white uppercase text-sm">
                  {hoveredData.country}
                </span>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                {hoveredData.iso2}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="text-cyan-400">Confirmed:</span>
                <span className="font-bold">{formatFullNumber(hoveredData.cases)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-emerald-400">Recovered:</span>
                <span className="font-bold">{formatFullNumber(hoveredData.recovered)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-rose-400">Fatalities:</span>
                <span className="font-bold">{formatFullNumber(hoveredData.deaths)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-amber-400">Recovery Rate:</span>
                <span className="font-bold">
                  {calculateRecoveryPercentage(hoveredData.recovered, hoveredData.cases)}%
                </span>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-cyan-400/80 flex items-center justify-center gap-1">
              <Eye className="h-3 w-3" /> Click to open detailed dossier
            </div>
          </div>
        )}
      </div>

      {/* Bottom Map Legend */}
      <div className="bg-slate-900/90 border-t border-cyan-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span>INFECTION INTENSITY:</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0d9488]"></span>
            <span className="text-slate-300 text-[11px]">&lt; 5M</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]"></span>
            <span className="text-slate-300 text-[11px]">5M - 15M</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]"></span>
            <span className="text-slate-300 text-[11px]">15M - 35M</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f43f5e]"></span>
            <span className="text-slate-300 text-[11px]">&gt; 35M</span>
          </div>
        </div>
      </div>
    </div>
  );
}
