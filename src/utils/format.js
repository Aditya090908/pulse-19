const intFmt = new Intl.NumberFormat('en-US');
const compactFmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const isNum = (n) => typeof n === 'number' && Number.isFinite(n);

export function formatInt(n) {
  return isNum(n) ? intFmt.format(Math.round(n)) : '—';
}

export function formatCompact(n) {
  if (!isNum(n)) return '—';
  return Math.abs(n) < 1000 ? intFmt.format(Math.round(n)) : compactFmt.format(n);
}

export function formatPercent(n, { sign = true, digits = 0 } = {}) {
  if (!isNum(n)) return '—';
  const abs = Math.abs(n).toFixed(digits);
  if (!sign) return `${abs}%`;
  if (Math.round(n * 10 ** digits) === 0) return `${abs}%`;
  return `${n > 0 ? '+' : '−'}${abs}%`;
}

export function formatRatio(part, whole, digits = 1) {
  if (!whole) return '—';
  return `${((part / whole) * 100).toFixed(digits)}%`;
}

const toDate = (iso) => new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);

/** Format a calendar day (YYYY-MM-DD) in UTC, e.g. "13 Nov 2026". */
export function formatDate(iso) {
  if (!iso) return '—';
  return toDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** "13 Nov" */
export function formatDay(iso) {
  if (!iso) return '—';
  return toDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** "Nov 26" */
export function formatMonth(iso) {
  if (!iso) return '—';
  return toDate(iso).toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' });
}

/** Local date and time for a full timestamp. */
export function formatDateTime(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Relative time between a timestamp and a reference ("now" of the data feed). */
export function formatRelative(value, nowMs = Date.now()) {
  const diff = nowMs - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${formatInt(count)} ${count === 1 ? singular : plural}`;
}
