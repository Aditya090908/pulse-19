import { Check, Circle, MapPin } from 'lucide-react';
import { COUNTRY_BY_CODE } from '../../data/countries.js';
import { DISEASE_BY_ID } from '../../data/diseases.js';
import { formatDateTime, formatRelative } from '../../utils/format.js';
import { ALERT_TYPES } from '../../utils/alerts.js';
import { RISK_LEVELS } from '../../utils/risk.js';
import { RiskBadge, DiseaseDot } from '../common/Badges.jsx';
import { ALERT_ICONS } from './alertIcons.js';

export default function AlertItem({ alert, read, nowMs, onToggleRead, onOpenCountry, compact = false }) {
  const type = ALERT_TYPES[alert.type];
  const Icon = ALERT_ICONS[type.icon];
  const severity = RISK_LEVELS[alert.severity];
  const country = alert.countryCode ? COUNTRY_BY_CODE[alert.countryCode] : null;
  const disease = alert.diseaseId ? DISEASE_BY_ID[alert.diseaseId] : null;

  return (
    <li
      className={`group relative flex gap-3 border-b border-line last:border-b-0 ${compact ? 'px-4 py-3' : 'px-5 py-4'} ${
        read ? '' : 'bg-accent/[0.04]'
      }`}
    >
      {!read && <span className="absolute left-0 top-0 h-full w-0.5 bg-accent" aria-hidden="true" />}
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${severity.badge}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className={`text-sm ${read ? 'font-medium text-ink-muted' : 'font-semibold text-ink'}`}>{alert.title}</h3>
          {!read && <span className="sr-only">Unread</span>}
        </div>
        {!compact && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{alert.body}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-muted">
          <RiskBadge level={alert.severity} />
          <span>{type.label}</span>
          {disease && (
            <span className="inline-flex items-center gap-1.5">
              <DiseaseDot color={disease.color} />
              {disease.short}
            </span>
          )}
          {country && onOpenCountry && (
            <button
              type="button"
              onClick={() => onOpenCountry(country.code)}
              className="inline-flex items-center gap-1 rounded text-accent-fg hover:underline"
            >
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {country.name}
            </button>
          )}
          <time dateTime={alert.timestamp} title={formatDateTime(alert.timestamp)} className="text-ink-faint">
            {formatRelative(alert.timestamp, nowMs)}
          </time>
        </div>
      </div>
      {onToggleRead && (
        <button
          type="button"
          onClick={() => onToggleRead(alert.id, read)}
          aria-label={read ? 'Mark as unread' : 'Mark as read'}
          title={read ? 'Mark as unread' : 'Mark as read'}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-lg text-ink-faint transition-colors hover:bg-panel-3 hover:text-ink"
        >
          {read ? <Circle className="h-4 w-4" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
    </li>
  );
}
