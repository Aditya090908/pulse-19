import { DISEASES } from './diseases.js';
import { REGIONS } from './countries.js';
import { RISK_KEYS, RISK_LEVELS } from '../utils/risk.js';

export const DISEASE_OPTIONS = [{ value: 'all', label: 'All diseases' }, ...DISEASES.map((d) => ({ value: d.id, label: d.name }))];
export const REGION_OPTIONS = [{ value: 'all', label: 'All regions' }, ...REGIONS.map((r) => ({ value: r, label: r }))];
export const RISK_OPTIONS = [{ value: 'all', label: 'All risk levels' }, ...RISK_KEYS.map((k) => ({ value: k, label: RISK_LEVELS[k].label }))];
