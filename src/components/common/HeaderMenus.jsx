import { Bell, Moon, Settings, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { navigate } from '../../hooks/useHashRoute.js';
import AlertItem from '../alerts/AlertItem.jsx';
import { DataProvenance } from './DataStatus.jsx';
import Popover from './Popover.jsx';
import Segmented from './Segmented.jsx';

const iconBtn =
  'relative flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong bg-panel-2 text-ink-muted transition-colors hover:border-accent/60 hover:text-accent-fg';

export function NotificationsMenu() {
  const { alerts, readSet, unreadCount, markRead, markUnread, markAllRead, selectCountry, meta } = useApp();
  const nowMs = meta ? new Date(meta.referenceTimestamp).getTime() : Date.now();
  const unread = alerts.filter((a) => !readSet.has(a.id));
  const shown = (unread.length ? unread : alerts).slice(0, 5);

  return (
    <Popover
      panelClassName="w-[min(92vw,380px)]"
      trigger={({ open, toggle }) => (
        <button type="button" onClick={toggle} aria-haspopup="true" aria-expanded={open} aria-label={`Notifications, ${unreadCount} unread`} className={iconBtn}>
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}
    >
      {({ close }) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">{unread.length ? 'Unread alerts' : 'Latest alerts'}</h2>
            {unread.length > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs text-accent-fg hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-[360px] overflow-y-auto">
            {shown.map((a) => (
              <AlertItem
                key={a.id}
                alert={a}
                compact
                read={readSet.has(a.id)}
                nowMs={nowMs}
                onToggleRead={(id, isRead) => (isRead ? markUnread(id) : markRead(id))}
                onOpenCountry={(code) => {
                  close();
                  selectCountry(code);
                }}
              />
            ))}
          </ul>
          <div className="border-t border-line px-4 py-2.5">
            <button
              type="button"
              className="text-sm font-medium text-accent-fg hover:underline"
              onClick={() => {
                close();
                navigate('/alerts');
              }}
            >
              Open alert centre
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}

export function SettingsMenu() {
  const { theme, setTheme } = useApp();
  return (
    <Popover
      panelClassName="w-[min(92vw,360px)]"
      trigger={({ open, toggle }) => (
        <button type="button" onClick={toggle} aria-haspopup="true" aria-expanded={open} aria-label="Settings" className={iconBtn}>
          <Settings className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    >
      <div className="space-y-5 p-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Theme</p>
          <Segmented
            label="Colour theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </div>
        <div className="border-t border-line pt-4">
          <DataProvenance compact />
        </div>
      </div>
    </Popover>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} className={iconBtn}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
