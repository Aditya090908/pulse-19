import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { COUNTRIES, COUNTRY_BY_CODE } from '../../data/countries.js';
import { DISEASE_BY_ID } from '../../data/diseases.js';
import useChartTheme from '../../hooks/useChartTheme.js';
import { codeForFeature, worldFeatures } from '../../services/geoService.js';
import { formatInt } from '../../utils/format.js';
import { RISK_LEVELS } from '../../utils/risk.js';
import MapLegend from './MapLegend.jsx';
import { getMapMetric } from './mapMetrics.js';

const WORLD_BOUNDS = [
  [-56, -165],
  [78, 175],
];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Blend two #rrggbb colours: amount 0 gives `a`, 1 gives `b`. */
function mixHex(a, b, amount) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * amount));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function styleFor(feature, { rowsByCode, t, selectedCode }) {
  const code = codeForFeature(feature);
  const row = code != null ? rowsByCode.get(code) : null;
  if (!row) return { weight: 0.6, color: t.border, fillColor: t.land, fillOpacity: 1 };
  const color = t.risk[row.risk.level];
  const selected = selectedCode === code;
  return {
    weight: selected ? 2 : 0.9,
    color: selected ? t.accent : color,
    fillColor: mixHex(t.land, color, selected ? 0.34 : 0.2),
    fillOpacity: 1,
  };
}

function rowTooltip(row, metric, t) {
  const level = RISK_LEVELS[row.risk.level];
  const diseases = row.diseaseIds.map((id) => DISEASE_BY_ID[id].short).join(', ');
  return `
    <div style="min-width:170px">
      <div style="font-weight:600;font-size:13px;margin-bottom:2px">${esc(row.name)}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
        <span style="width:8px;height:8px;border-radius:9999px;background:${t.risk[row.risk.level]};display:inline-block"></span>
        <span>${level.label} risk</span>
      </div>
      <div style="display:flex;justify-content:space-between;gap:16px"><span style="opacity:.7">${esc(metric.short)}</span><strong>${formatInt(metric.get(row))}</strong></div>
      <div style="display:flex;justify-content:space-between;gap:16px"><span style="opacity:.7">Fatalities</span><strong>${formatInt(row.deaths)}</strong></div>
      <div style="display:flex;justify-content:space-between;gap:16px"><span style="opacity:.7">Active outbreaks</span><strong>${row.activeOutbreaks}</strong></div>
      <div style="margin-top:6px;opacity:.7">${esc(diseases)}</div>
      <div style="margin-top:6px;font-size:11px;opacity:.6">Click for details</div>
    </div>`;
}

const emptyTooltip = (name) =>
  `<div><div style="font-weight:600">${esc(name)}</div><div style="opacity:.65;margin-top:2px">No outbreaks in the simulated dataset</div></div>`;

export default function GlobalMap({
  rows,
  metric = 'cases',
  selectedCode = null,
  onSelect,
  height = 560,
  region = 'all',
  compact = false,
  showControls = true,
  className = '',
}) {
  const t = useChartTheme();
  const containerRef = useRef(null);
  const mapState = useRef({ map: null, geo: null, markers: null });
  const live = useRef({});
  const firstRegionRun = useRef(true);
  const metricMeta = getMapMetric(metric);
  const rowsByCode = useMemo(() => new Map(rows.map((r) => [r.code, r])), [rows]);

  // Keep the latest props available to Leaflet event handlers.
  useEffect(() => {
    live.current = { rowsByCode, onSelect, metric: metricMeta, t, selectedCode };
  });

  // Create the map once.
  useEffect(() => {
    const map = L.map(containerRef.current, {
      zoomControl: false,
      minZoom: 1,
      maxZoom: 7,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 90,
      worldCopyJump: false,
      maxBounds: [
        [-85, -195],
        [85, 195],
      ],
      maxBoundsViscosity: 0.9,
      scrollWheelZoom: !compact,
      attributionControl: true,
    });
    map.attributionControl.setPrefix(false);
    map.attributionControl.addAttribution('Boundaries: Natural Earth via world-atlas');
    map.fitBounds(WORLD_BOUNDS, { animate: false });
    map.setMinZoom(Math.max(0.75, map.getZoom() - 0.5));

    const geo = L.geoJSON(
      { type: 'FeatureCollection', features: worldFeatures },
      {
        style: (feature) => styleFor(feature, live.current),
        onEachFeature: (feature, layer) => {
          const code = codeForFeature(feature);
          layer.bindTooltip(
            () => {
              const { rowsByCode: byCode, metric: m, t: theme } = live.current;
              const row = code != null ? byCode.get(code) : null;
              return row ? rowTooltip(row, m, theme) : emptyTooltip(feature.properties?.name ?? 'Unknown territory');
            },
            { sticky: true, className: 'pulse-tooltip', direction: 'top', offset: [0, -10], opacity: 1 },
          );
          layer.on('click', () => {
            if (code != null && live.current.rowsByCode.has(code)) live.current.onSelect?.(code);
          });
          layer.on('mouseover', () => {
            if (code != null && live.current.rowsByCode.has(code)) layer.setStyle({ weight: 1.8 });
          });
          layer.on('mouseout', () => layer.setStyle(styleFor(feature, live.current)));
        },
      },
    ).addTo(map);

    const markers = L.layerGroup().addTo(map);
    mapState.current = { map, geo, markers };

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapState.current = { map: null, geo: null, markers: null };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw polygons and markers whenever data, metric, selection or theme change.
  useEffect(() => {
    const { map, geo, markers } = mapState.current;
    if (!map) return;
    const ctx = { rowsByCode, t, selectedCode };
    geo.eachLayer((layer) => layer.setStyle(styleFor(layer.feature, ctx)));

    markers.clearLayers();
    const max = Math.max(1, ...rows.map((r) => metricMeta.get(r)));
    const span = compact ? 15 : 26;
    const ordered = [...rows].sort((a, b) => metricMeta.get(b) - metricMeta.get(a));
    ordered.forEach((row) => {
      const country = COUNTRY_BY_CODE[row.code];
      const color = t.risk[row.risk.level];
      const radius = 5 + Math.sqrt(metricMeta.get(row) / max) * span;
      const latlng = [country.lat, country.lng];

      if (row.risk.level === 'critical') {
        L.circleMarker(latlng, { radius: radius + 6, color, weight: 1.2, fill: false, className: 'pulse-ring', interactive: false }).addTo(markers);
      }
      if (selectedCode === row.code) {
        L.circleMarker(latlng, { radius: radius + 5, color: t.accent, weight: 2, fill: false, interactive: false }).addTo(markers);
      }
      const marker = L.circleMarker(latlng, { radius, color, weight: 1.5, fillColor: color, fillOpacity: 0.38 });
      marker.bindTooltip(rowTooltip(row, metricMeta, t), { className: 'pulse-tooltip', direction: 'top', offset: [0, -radius], opacity: 1 });
      marker.on('click', () => live.current.onSelect?.(row.code));
      marker.on('mouseover', () => marker.setStyle({ fillOpacity: 0.6, weight: 2.2 }));
      marker.on('mouseout', () => marker.setStyle({ fillOpacity: 0.38, weight: 1.5 }));
      marker.addTo(markers);
    });
  }, [rows, rowsByCode, metricMeta, selectedCode, t, compact]);

  // Fly to the chosen region.
  useEffect(() => {
    if (firstRegionRun.current) {
      firstRegionRun.current = false;
      return;
    }
    const { map } = mapState.current;
    if (!map) return;
    if (region === 'all') {
      map.flyToBounds(WORLD_BOUNDS, { duration: 0.8 });
      return;
    }
    const points = COUNTRIES.filter((c) => c.region === region).map((c) => [c.lat, c.lng]);
    map.flyToBounds(L.latLngBounds(points).pad(0.3), { duration: 0.8, maxZoom: 5 });
  }, [region]);

  const zoomBtn =
    'flex h-8 w-8 items-center justify-center rounded-md border border-line-strong bg-panel/90 text-ink-muted shadow-panel backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-accent-fg';

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <div
        ref={containerRef}
        className="pulse-map h-full w-full"
        role="application"
        aria-label="Interactive global outbreak map. The same figures are listed on the Country intelligence page."
      />
      {showControls && (
        <div className="absolute right-3 top-3 z-[500] flex flex-col gap-1.5">
          <button type="button" className={zoomBtn} aria-label="Zoom in" onClick={() => mapState.current.map?.zoomIn()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" className={zoomBtn} aria-label="Zoom out" onClick={() => mapState.current.map?.zoomOut()}>
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={zoomBtn}
            aria-label="Reset view"
            onClick={() => mapState.current.map?.flyToBounds(WORLD_BOUNDS, { duration: 0.8 })}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      <MapLegend metricLabel={metricMeta.short} compact={compact} />
      {rows.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
          <p className="rounded-lg border border-line-strong bg-panel/90 px-4 py-2 text-sm text-ink-muted">No outbreaks match the current filters.</p>
        </div>
      )}
    </div>
  );
}
