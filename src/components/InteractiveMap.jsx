import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';

const METRIC_THEMES = {
  cases: {
    color: '#06b6d4',
    fillColor: '#06b6d4',
    multiplier: 85,
    label: 'Total Influx',
  },
  active: {
    color: '#f59e0b',
    fillColor: '#f59e0b',
    multiplier: 130,
    label: 'Active Load',
  },
  recovered: {
    color: '#10b981',
    fillColor: '#10b981',
    multiplier: 85,
    label: 'Recoveries',
  },
  deaths: {
    color: '#f43f5e',
    fillColor: '#f43f5e',
    multiplier: 650,
    label: 'Fatalities',
  },
};

export default function InteractiveMap({
  countries,
  selectedMetric = 'cases',
  center = [20, 0],
  zoom = 2,
  onCountrySelect,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circlesLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        minZoom: 1.8,
        maxZoom: 9,
        worldCopyJump: true,
      });

      // CartoDB Dark Matter with high-contrast tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      circlesLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center / Zoom flyTo
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.flyTo(center, zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom]);

  // Update circles when countries or selectedMetric change
  useEffect(() => {
    if (!mapInstanceRef.current || !circlesLayerRef.current) return;

    circlesLayerRef.current.clearLayers();

    const config = METRIC_THEMES[selectedMetric] || METRIC_THEMES.cases;

    countries.forEach((country) => {
      const { lat, long: lng, flag } = country.countryInfo || {};
      if (!lat || !lng) return;

      const value = country[selectedMetric] || 0;
      if (value <= 0) return;

      // Logarithmic scaled radius
      const radius = Math.sqrt(value) * config.multiplier * 0.4 + 45000;

      // Outer Radar Ripple Circle
      const radarCircle = L.circle([lat, lng], {
        color: config.color,
        fillColor: 'transparent',
        weight: 1,
        dashArray: '4, 8',
        opacity: 0.6,
        radius: Math.min(radius * 1.35, 3000000),
      });

      // Inner Core Circle
      const circle = L.circle([lat, lng], {
        color: config.color,
        fillColor: config.fillColor,
        fillOpacity: 0.45,
        weight: 1.5,
        radius: Math.min(radius, 2200000),
      });

      const recoveryPercent = country.cases > 0
        ? ((country.recovered / country.cases) * 100).toFixed(1)
        : 0;

      const popupHtml = `
        <div class="p-2.5 text-slate-100 min-w-[230px] font-mono">
          <div class="flex items-center gap-2 mb-2 pb-2 border-b border-cyan-500/30">
            <img src="${flag}" alt="${country.country}" class="h-4 w-6 object-cover rounded shadow border border-slate-700" />
            <div>
              <h4 class="font-bold text-sm text-cyan-300">${country.country.toUpperCase()}</h4>
              <p class="text-[9px] text-slate-400">LOC: [${lat.toFixed(2)}, ${lng.toFixed(2)}]</p>
            </div>
          </div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-cyan-400">Cases:</span>
              <span class="font-bold text-white">${formatFullNumber(country.cases)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-amber-400">Active:</span>
              <span class="font-bold text-white">${formatFullNumber(country.active)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-emerald-400">Recovered:</span>
              <span class="font-bold text-white">${formatFullNumber(country.recovered)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-rose-400">Deaths:</span>
              <span class="font-bold text-white">${formatFullNumber(country.deaths)}</span>
            </div>
          </div>
          <div class="mt-3 pt-2 border-t border-slate-800">
            <div class="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Recovery Rate</span>
              <span class="text-emerald-400 font-bold">${recoveryPercent}%</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div class="bg-emerald-400 h-full" style="width: ${Math.min(recoveryPercent, 100)}%"></div>
            </div>
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);

      circle.on('click', () => {
        if (onCountrySelect) {
          onCountrySelect(country.countryInfo.iso2 || country.country);
        }
      });

      radarCircle.addTo(circlesLayerRef.current);
      circle.addTo(circlesLayerRef.current);
    });
  }, [countries, selectedMetric, onCountrySelect]);

  const activeTheme = METRIC_THEMES[selectedMetric] || METRIC_THEMES.cases;

  return (
    <div className="relative w-full h-[480px] lg:h-[540px] rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl bg-[#030712]">
      {/* Map Target Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left HUD Telemetry Readout */}
      <div className="absolute top-4 left-4 z-20 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30 text-[11px] font-mono shadow-xl flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-cyan-400 font-bold uppercase">RADAR ACTIVE</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">
          CTR: [{center[0].toFixed(1)}, {center[1].toFixed(1)}]
        </span>
      </div>

      {/* Bottom HUD Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30 text-xs font-mono shadow-xl flex items-center gap-2.5">
        <span className="text-slate-400">LAYER:</span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: activeTheme.color, color: activeTheme.color }}
          ></span>
          <span className="font-bold text-white uppercase">{selectedMetric}</span>
        </div>
      </div>
    </div>
  );
}
