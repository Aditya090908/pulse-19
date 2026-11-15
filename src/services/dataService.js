// Data access layer.
//
// PULSE-19 ships with a simulated dataset and has no live API configured.
// To connect a real source later, return a snapshot with the same shape from
// `loadSnapshot` (see src/data/generateSnapshot.js) and set `meta.simulated` to false.

import { generateSnapshot } from '../data/generateSnapshot.js';

const LATENCY_MS = 350;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function resolveReferenceDate() {
  const pinned = import.meta.env?.VITE_PULSE_REFERENCE_DATE;
  if (pinned) {
    const parsed = new Date(pinned);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export async function loadSnapshot() {
  await sleep(LATENCY_MS);
  return generateSnapshot({ referenceDate: resolveReferenceDate() });
}

export const DATA_SOURCE = {
  name: 'Simulated demonstration dataset',
  live: false,
  note: 'No live data source is configured.',
};
