
import { AlertTriangle, Compass } from 'lucide-react';
import { useApp } from './context/AppContext.jsx';
import Button from './components/common/Button.jsx';
import EmptyState from './components/common/EmptyState.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import Logo from './components/common/Logo.jsx';
import useHashRoute from './hooks/useHashRoute.js';
import AppShell from './layouts/AppShell.jsx';

import AlertsPage from './pages/AlertsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import CountriesPage from './pages/CountriesPage.jsx';
import DiseasesPage from './pages/DiseasesPage.jsx';
import MapPage from './pages/MapPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import CDCSurveillance from './components/surveillance/CDCSurveillance.jsx';

const PAGES = {
  overview: OverviewPage,
  map: MapPage,
  analytics: AnalyticsPage,
  countries: CountriesPage,
  diseases: DiseasesPage,
  alerts: AlertsPage,
  surveillance: CDCSurveillance,
};

function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <Logo />
      <p className="animate-soft-pulse text-sm text-ink-muted">
        Loading the simulated dataset…
      </p>
    </div>
  );
}

function Content({ route }) {
  const { status, error, refresh } = useApp();

  // CDC surveillance uses its own live API, independently of the demo dataset.
  if (route.name === 'surveillance') {
    return (
      <ErrorBoundary key={route.name}>
        <CDCSurveillance />
      </ErrorBoundary>
    );
  }

  if (status === 'loading') return <Loading />;

  if (status === 'error') {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="The dataset could not be loaded"
        description={error?.message ?? 'An unexpected error occurred while preparing the data.'}
        action={<Button onClick={refresh}>Try again</Button>}
      />
    );
  }

  const Page = PAGES[route.name];

  if (!Page) {
    return (
      <EmptyState
        icon={Compass}
        title="That page does not exist"
        description="Use the navigation above to pick a section."
        action={
          <a href="#/overview" className="text-sm font-medium text-accent-fg hover:underline">
            Go to the overview
          </a>
        }
      />
    );
  }

  return (
    <ErrorBoundary key={route.name}>
      <Page param={route.param} />
    </ErrorBoundary>
  );
}

export default function App() {
  const route = useHashRoute();

  return (
    <AppShell route={route}>
      <Content route={route} />
    </AppShell>
  );
}
