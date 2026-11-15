import { RISK_COLORS } from '../../utils/risk.js';

const THEMES = {
  dark: {
    grid: '#2D3340',
    axis: '#9CA3AF',
    cursor: 'rgba(245, 158, 11, 0.08)',
    accent: '#f59e0b',
    previous: '#4B5563',
    text: '#ECE9E2',
    land: '#1A1E26',
    border: '#3A4150',
  },
  light: {
    grid: '#E2DED5',
    axis: '#78716C',
    cursor: 'rgba(180, 83, 9, 0.07)',
    accent: '#b45309',
    previous: '#cfc9bc',
    text: '#1C1917',
    land: '#FFFFFF',
    border: '#C4C0B6',
  },
};

export function getChartTheme(theme) {
  const key = theme === 'light' ? 'light' : 'dark';
  return { ...THEMES[key], risk: RISK_COLORS[key], mode: key };
}
