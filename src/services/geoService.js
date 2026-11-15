
// Natural Earth country geometry from world-atlas.
// Split polygons at the antimeridian before passing them to Leaflet.
// This prevents long horizontal edges across the map.

import { feature } from 'topojson-client';
import topology from 'world-atlas/countries-110m.json';

const ANTARCTICA = 10;
const WORLD_WIDTH = 360;
const HALF_WORLD = 180;

function unwrapRing(ring, referenceCenter = null) {
  if (!ring?.length) return [];

  const points = [];
  let previous = ring[0][0];

  let firstLongitude = previous;

  if (referenceCenter != null) {
    firstLongitude +=
      Math.round((referenceCenter - firstLongitude) / WORLD_WIDTH) *
      WORLD_WIDTH;
  }

  points.push([firstLongitude, ring[0][1]]);

  previous = firstLongitude;

  for (let i = 1; i < ring.length; i += 1) {
    let longitude = ring[i][0];

    while (longitude - previous > HALF_WORLD) {
      longitude -= WORLD_WIDTH;
    }

    while (longitude - previous < -HALF_WORLD) {
      longitude += WORLD_WIDTH;
    }

    points.push([longitude, ring[i][1]]);
    previous = longitude;
  }

  return points;
}

function clipAtLongitude(ring, boundary, keepGreater) {
  if (!ring.length) return [];

  const inside = (point) =>
    keepGreater
      ? point[0] >= boundary
      : point[0] <= boundary;

  const output = [];

  let previous = ring[ring.length - 1];
  let previousInside = inside(previous);

  for (const current of ring) {
    const currentInside = inside(current);

    if (currentInside !== previousInside) {
      const denominator = current[0] - previous[0];

      if (denominator !== 0) {
        const ratio = (boundary - previous[0]) / denominator;

        output.push([
          boundary,
          previous[1] + ratio * (current[1] - previous[1]),
        ]);
      }
    }

    if (currentInside) {
      output.push(current);
    }

    previous = current;
    previousInside = currentInside;
  }

  return output;
}

function clipRingToWindow(ring, west, east) {
  let clipped = clipAtLongitude(ring, west, true);
  clipped = clipAtLongitude(clipped, east, false);

  if (clipped.length < 3) return [];

  const first = clipped[0];
  const last = clipped[clipped.length - 1];

  if (
    first[0] !== last[0] ||
    first[1] !== last[1]
  ) {
    clipped.push([...first]);
  }

  return clipped.length >= 4 ? clipped : [];
}

function ringCenter(ring) {
  if (!ring.length) return 0;

  return (
    ring.reduce((sum, point) => sum + point[0], 0) /
    ring.length
  );
}

function splitPolygon(polygon) {
  const [outer, ...holes] = polygon;

  if (!outer?.length) return [];

  const unwrappedOuter = unwrapRing(outer);
  const center = ringCenter(unwrappedOuter);

  const unwrappedHoles = holes.map((ring) =>
    unwrapRing(ring, center),
  );

  const longitudes = unwrappedOuter.map((point) => point[0]);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  const firstWindow = Math.floor(
    (minLongitude + HALF_WORLD) / WORLD_WIDTH,
  );

  const lastWindow = Math.floor(
    (maxLongitude + HALF_WORLD) / WORLD_WIDTH,
  );

  const pieces = [];

  for (
    let window = firstWindow;
    window <= lastWindow;
    window += 1
  ) {
    const west = -HALF_WORLD + window * WORLD_WIDTH;
    const east = HALF_WORLD + window * WORLD_WIDTH;

    const clippedOuter = clipRingToWindow(
      unwrappedOuter,
      west,
      east,
    );

    if (!clippedOuter.length) continue;

    const shiftedOuter = clippedOuter.map(([lng, lat]) => [
      lng - window * WORLD_WIDTH,
      lat,
    ]);

    const shiftedHoles = unwrappedHoles
      .map((hole) => clipRingToWindow(hole, west, east))
      .filter((hole) => hole.length)
      .map((hole) =>
        hole.map(([lng, lat]) => [
          lng - window * WORLD_WIDTH,
          lat,
        ]),
      );

    pieces.push([shiftedOuter, ...shiftedHoles]);
  }

  return pieces;
}

function splitGeometry(geometry) {
  if (!geometry) return geometry;

  if (geometry.type === 'Polygon') {
    const pieces = splitPolygon(geometry.coordinates);

    if (pieces.length <= 1) {
      return {
        ...geometry,
        coordinates: pieces[0] ?? geometry.coordinates,
      };
    }

    return {
      type: 'MultiPolygon',
      coordinates: pieces,
    };
  }

  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.flatMap(splitPolygon),
    };
  }

  return geometry;
}

const rawFeatures = feature(
  topology,
  topology.objects.countries,
).features;

export const worldFeatures = rawFeatures
  .filter((item) => Number(item.id) !== ANTARCTICA)
  .map((item) => ({
    ...item,
    geometry: splitGeometry(item.geometry),
  }));

const byCode = new Map();

for (const item of worldFeatures) {
  if (item.id != null) {
    byCode.set(Number(item.id), item);
  }
}

export const featureForCode = (code) =>
  byCode.get(Number(code)) ?? null;

export const codeForFeature = (item) =>
  item.id != null ? Number(item.id) : null;
