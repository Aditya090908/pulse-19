import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getChartTheme } from '../components/charts/chartTheme.js';

export default function useChartTheme() {
  const { theme } = useApp();
  return useMemo(() => getChartTheme(theme), [theme]);
}
