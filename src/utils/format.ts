export function formatMoney(amount: number | undefined | null, currency = 'AUD'): string {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) return '—';
  return `${(value * 100).toFixed(2)}%`;
}

export function formatDate(value: string | undefined | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Compact currency for chart axes/ticks, e.g. $12.3K, $4.2M. Falls back to formatMoney under $1,000. */
export function formatCompactMoney(amount: number, currency = 'AUD'): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return formatMoney(amount, currency);
}
