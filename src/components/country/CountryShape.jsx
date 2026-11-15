import { useMemo } from 'react';
import { geoArea, geoMercator, geoPath } from 'd3-geo';
import { featureForCode } from '../../services/geoService.js';

/** Country silhouette drawn with d3-geo. Small remote islands are dropped so the shape stays readable. */
export default function CountryShape({ code, color = 'currentColor', width = 132, height = 96, className = '' }) {
  const path = useMemo(() => {
    const feature = featureForCode(code);
    if (!feature) return null;
    let geometry = feature.geometry;
    if (geometry.type === 'MultiPolygon') {
      const polys = geometry.coordinates.map((coordinates) => ({ type: 'Polygon', coordinates }));
      const areas = polys.map((p) => geoArea(p));
      const biggest = Math.max(...areas);
      const kept = polys.filter((_, i) => areas[i] >= biggest * 0.25);
      geometry = { type: 'MultiPolygon', coordinates: kept.map((p) => p.coordinates) };
    }
    const pad = 6;
    const projection = geoMercator().fitExtent(
      [
        [pad, pad],
        [width - pad, height - pad],
      ],
      geometry,
    );
    return geoPath(projection)(geometry);
  }, [code, width, height]);

  if (!path) return null;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <path d={path} fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
