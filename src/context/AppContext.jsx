import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import usePersistentState from '../hooks/usePersistentState.js';
import { loadSnapshot } from '../services/dataService.js';
import { buildCountryRows, buildDiseaseRows, buildMetricCards, summarize } from '../utils/aggregate.js';
import { buildAlerts } from '../utils/alerts.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [snapshot, setSnapshot] = useState(null);
  const [status, setStatus] = useState('loading');
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);
  const [theme, setTheme] = usePersistentState('pulse19.theme', 'dark');
  const [readIds, setReadIds] = usePersistentState('pulse19.alerts.read', []);
  const [selectedCode, setSelectedCode] = useState(null);

  const load = useCallback(async (initial) => {
    try {
      if (!initial) setSyncing(true);
      const next = await loadSnapshot();
      setSnapshot(next);
      setSyncedAt(new Date());
      setError(null);
      setStatus('ready');
    } catch (err) {
      setError(err);
      if (initial) setStatus('error');
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme !== 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#090B0F' : '#f4f2ed');
  }, [theme]);

  const derived = useMemo(() => {
    if (!snapshot) return null;
    const countryRows = buildCountryRows(snapshot.outbreaks);
    return {
      countryRows,
      countryByCode: new Map(countryRows.map((r) => [r.code, r])),
      metricCards: buildMetricCards(snapshot.outbreaks, snapshot.meta.monitoredCountries),
      diseaseRows: buildDiseaseRows(snapshot.outbreaks),
      summary: summarize(snapshot.outbreaks),
      alerts: buildAlerts(snapshot),
    };
  }, [snapshot]);

  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const alerts = derived?.alerts;
  const unreadCount = useMemo(() => (alerts ? alerts.filter((a) => !readSet.has(a.id)).length : 0), [alerts, readSet]);

  const markRead = useCallback((id) => setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id])), [setReadIds]);
  const markUnread = useCallback((id) => setReadIds((prev) => prev.filter((x) => x !== id)), [setReadIds]);
  const markAllRead = useCallback(() => {
    if (alerts) setReadIds(alerts.map((a) => a.id));
  }, [alerts, setReadIds]);

  const value = useMemo(
    () => ({
      status,
      error,
      syncing,
      syncedAt,
      snapshot,
      dates: snapshot?.dates ?? [],
      outbreaks: snapshot?.outbreaks ?? [],
      meta: snapshot?.meta ?? null,
      ...(derived ?? {}),
      alerts: alerts ?? [],
      readSet,
      unreadCount,
      markRead,
      markUnread,
      markAllRead,
      refresh: () => load(false),
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      selectedCode,
      selectCountry: setSelectedCode,
    }),
    [status, error, syncing, syncedAt, snapshot, derived, alerts, readSet, unreadCount, markRead, markUnread, markAllRead, load, theme, setTheme, selectedCode],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
