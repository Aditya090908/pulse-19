import { DataNoticeBar } from '../components/common/DataStatus.jsx';
import { NotificationsMenu, SettingsMenu, ThemeToggle } from '../components/common/HeaderMenus.jsx';
import Logo from '../components/common/Logo.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import CountryPanel from '../components/country/CountryPanel.jsx';
import PrintReport from '../components/print/PrintReport.jsx';
import { NAV_ITEMS } from './navigation.js';

export default function AppShell({ route, children }) {
  return (
    <>
      <div className="pulse-print-hide flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-canvas">
          Skip to content
        </a>
        <DataNoticeBar />
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
            <Logo className="order-1" />
            <nav aria-label="Primary" className="order-4 -mx-1 w-full overflow-x-auto lg:order-2 lg:mx-0 lg:w-auto lg:flex-1">
              <ul className="flex min-w-max items-center gap-1 px-1 lg:px-0">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                  const active = route.name === id;
                  return (
                    <li key={id}>
                      <a
                        href={`#/${id}`}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          active ? 'bg-accent/10 text-accent-fg' : 'text-ink-muted hover:bg-panel-3 hover:text-ink'
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="order-5 w-full md:order-2 md:ml-auto md:w-72 lg:order-3 lg:ml-0">
              <SearchBox />
            </div>
            <div className="order-2 ml-auto flex items-center gap-2 md:order-3 md:ml-0 lg:order-4">
              <ThemeToggle />
              <NotificationsMenu />
              <SettingsMenu />
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>

        <footer className="border-t border-line px-4 py-6 text-xs text-ink-muted sm:px-6">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
            <p>PULSE-19 is a demonstration project. All outbreak figures are simulated. Map boundaries: Natural Earth via world-atlas.</p>
            <p>Built by Aditya Kumar. MIT License.</p>
          </div>
        </footer>
      </div>

      <CountryPanel />
      <PrintReport />
    </>
  );
}
