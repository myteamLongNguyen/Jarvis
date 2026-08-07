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
