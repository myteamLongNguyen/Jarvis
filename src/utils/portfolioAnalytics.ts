import type { Invoice } from '../types/invoice';
import type { Property, PropertyCategory } from '../types/property';

export const PERIOD_OPTIONS = [
  { value: '6M', label: '6 months', months: 6 },
  { value: '12M', label: '12 months', months: 12 },
  { value: 'YTD', label: 'Year to date', months: undefined },
] as const;
export type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value'];

export const CATEGORY_FILTERS = [
  { value: 'ALL', label: 'All properties' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'PERSONAL', label: 'Personal' },
] as const;
export type CategoryFilterValue = (typeof CATEGORY_FILTERS)[number]['value'];

/** Invoice statuses that represent a real, recognised cash movement rather than a draft or a dropped charge. */
const REALISED_STATUSES = new Set(['APPROVED', 'PAID', 'OVERDUE']);

export interface MonthlyPoint {
  key: string;
  label: string;
  income: number;
  spending: number;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date, spansYears: boolean): string {
  return date.toLocaleDateString('en-AU', { month: 'short', year: spansYears ? '2-digit' : undefined });
}

/** Returns the ISO from/to bounds for a period, anchored to the start of the earliest month. */
export function getPeriodRange(period: PeriodValue, now = new Date()): { from: string; to: string; months: number } {
  const to = now;
  let from: Date;
  let months: number;

  if (period === 'YTD') {
    from = new Date(to.getFullYear(), 0, 1);
    months = to.getMonth() + 1;
  } else {
    const span = PERIOD_OPTIONS.find((p) => p.value === period)?.months ?? 12;
    from = new Date(to.getFullYear(), to.getMonth() - (span - 1), 1);
    months = span;
  }

  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), months };
}

/** Builds an ordered map of empty month buckets between `from` and `to` inclusive. */
function buildEmptyBuckets(from: string, to: string): Map<string, MonthlyPoint> {
  const buckets = new Map<string, MonthlyPoint>();
  const start = new Date(from);
  const end = new Date(to);
  const spansYears = start.getFullYear() !== end.getFullYear();

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    const key = monthKey(cursor);
    buckets.set(key, { key, label: monthLabel(cursor, spansYears), income: 0, spending: 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return buckets;
}

/** Maps propertyId -> category, so invoices (which only carry a propertyId) can be filtered by category. */
export function buildCategoryMap(properties: Property[]): Map<string, PropertyCategory> {
  return new Map(properties.map((p) => [p.id, p.category]));
}

/**
 * Groups invoices into monthly income/spending totals, restricted to the given date range
 * and optionally to one property category. Invoices without a matching property are excluded
 * whenever a specific category is selected (there's nothing to categorise them by).
 */
export function buildMonthlySeries(
  invoices: Invoice[],
  categoryMap: Map<string, PropertyCategory>,
  from: string,
  to: string,
  categoryFilter: CategoryFilterValue,
): MonthlyPoint[] {
  const buckets = buildEmptyBuckets(from, to);

  for (const invoice of invoices) {
    if (!REALISED_STATUSES.has(invoice.status)) continue;

    const category = invoice.propertyId ? categoryMap.get(invoice.propertyId) : undefined;
    if (categoryFilter !== 'ALL' && category !== categoryFilter) continue;

    const key = monthKey(new Date(invoice.issueDate));
    const bucket = buckets.get(key);
    if (!bucket) continue;

    if (invoice.direction === 'INCOMING') bucket.income += invoice.totalAmount;
    else bucket.spending += invoice.totalAmount;
  }

  return Array.from(buckets.values());
}

export function filterRankedByCategory<T extends { propertyId: string }>(
  items: T[],
  categoryMap: Map<string, PropertyCategory>,
  categoryFilter: CategoryFilterValue,
): T[] {
  if (categoryFilter === 'ALL') return items;
  return items.filter((item) => categoryMap.get(item.propertyId) === categoryFilter);
}
