import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatCompactNumber, formatFullNumber } from '../utils/formatters';

const METRIC_CONFIG = {
  cases: {
    color: '#f43f5e',
    fillColor: '#f43f5e',
    multiplier: 80,
    label: 'Total Cases',
  },
  recovered: {
    color: '#10b981',
    fillColor: '#10b981',
    multiplier: 80,
    label: 'Recovered',
  },
  deaths: {
    color: '#94a3b8',
    fillColor: '#94a3b8',
    multiplier: 600,
    label: 'Deaths',
  },
  active: {
    color: '#f59e0b',
    fillColor: '#f59e0b',
    multiplier: 120,
    label: 'Active Cases',
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
        maxZoom: 10,
        worldCopyJump: true,
      });

      // CartoDB Dark Matter basemap for a sleek, modern UI
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

  // Center / Zoom update when country changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom]);

  // Update circles when countries or selectedMetric change
  useEffect(() => {
    if (!mapInstanceRef.current || !circlesLayerRef.current) return;

    circlesLayerRef.current.clearLayers();

    const config = METRIC_CONFIG[selectedMetric] || METRIC_CONFIG.cases;

    countries.forEach((country) => {
      const { lat, long: lng, flag } = country.countryInfo || {};
      if (!lat || !lng) return;

      const value = country[selectedMetric] || 0;
      if (value <= 0) return;

      // Logarithmic radius calculation for visual balance
      const radius = Math.sqrt(value) * config.multiplier * 0.4 + 50000;

      const circle = L.circle([lat, lng], {
        color: config.color,
        fillColor: config.fillColor,
        fillOpacity: 0.35,
        weight: 1.5,
        radius: Math.min(radius, 2500000),
      });

      const popupHtml = `
        <div class="p-2 text-slate-100 min-w-[210px] font-sans">
          <div class="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/60">
            <img src="${flag}" alt="${country.country}" class="h-4 w-6 object-cover rounded shadow" />
            <h4 class="font-bold text-base text-white">${country.country}</h4>
          </div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-rose-400 font-medium">Cases:</span>
              <span class="font-bold text-slate-200">${formatFullNumber(country.cases)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-emerald-400 font-medium">Recovered:</span>
              <span class="font-bold text-slate-200">${formatFullNumber(country.recovered)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400 font-medium">Deaths:</span>
              <span class="font-bold text-slate-200">${formatFullNumber(country.deaths)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-amber-400 font-medium">Active:</span>
              <span class="font-bold text-slate-200">${formatFullNumber(country.active)}</span>
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

      circle.addTo(circlesLayerRef.current);
    });
  }, [countries, selectedMetric, onCountrySelect]);

  return (
    <div className="relative w-full h-[480px] lg:h-[560px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700/60 text-xs shadow-lg flex items-center gap-3">
        <span className="font-semibold text-slate-300">Map Mode:</span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: (METRIC_CONFIG[selectedMetric] || METRIC_CONFIG.cases).color }}
          ></span>
          <span className="font-medium text-white capitalize">{selectedMetric}</span>
        </div>
      </div>
    </div>
  );
}
