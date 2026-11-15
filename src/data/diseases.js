// Disease catalogue. `rate` and `cfr` only drive the simulated dataset generator.

export const DISEASES = [
  { id: 'cholera', name: 'Cholera', short: 'Cholera', transmission: 'Waterborne', color: '#f59e0b', rate: 1.0, cfr: 0.02,
    summary: 'Acute diarrhoeal infection spread through contaminated water and food.' },
  { id: 'dengue', name: 'Dengue', short: 'Dengue', transmission: 'Mosquito-borne', color: '#fb923c', rate: 2.4, cfr: 0.004,
    summary: 'Viral infection spread by Aedes mosquitoes, concentrated in warm, wet regions.' },
  { id: 'measles', name: 'Measles', short: 'Measles', transmission: 'Airborne', color: '#facc15', rate: 1.6, cfr: 0.012,
    summary: 'Highly contagious respiratory virus that re-emerges where vaccination coverage drops.' },
  { id: 'mpox', name: 'Mpox', short: 'Mpox', transmission: 'Close contact', color: '#f87171', rate: 0.7, cfr: 0.015,
    summary: 'Viral zoonosis that spreads through close physical contact.' },
  { id: 'marburg', name: 'Marburg virus disease', short: 'Marburg', transmission: 'Bodily fluids', color: '#a8a29e', rate: 0.08, cfr: 0.42,
    summary: 'Rare haemorrhagic fever with a very high fatality ratio.' },
  { id: 'h5n1', name: 'Avian influenza (H5N1)', short: 'H5N1', transmission: 'Animal contact', color: '#6fb3a8', rate: 0.06, cfr: 0.3,
    summary: 'Avian influenza with sporadic human infections linked to infected animals.' },
  { id: 'chikungunya', name: 'Chikungunya', short: 'Chikungunya', transmission: 'Mosquito-borne', color: '#d6b88a', rate: 1.3, cfr: 0.001,
    summary: 'Mosquito-borne viral fever with severe, long-lasting joint pain.' },
  { id: 'diphtheria', name: 'Diphtheria', short: 'Diphtheria', transmission: 'Respiratory droplets', color: '#8f7a5e', rate: 0.5, cfr: 0.06,
    summary: 'Bacterial throat infection that returns where routine immunisation lapses.' },
];

export const DISEASE_BY_ID = Object.fromEntries(DISEASES.map((d) => [d.id, d]));

export const getDisease = (id) => DISEASE_BY_ID[id];
