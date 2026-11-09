/**
 * Number and string formatting utilities
 */

export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function formatFullNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString();
}

export function formatStatChange(num) {
  if (!num) return '+0';
  return `+${Number(num).toLocaleString()}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return 'Live';
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
