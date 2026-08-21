/**
 * Client-side mirror of the backend's Australian financial year math
 * (src/core/utils.ts in jarvis-server). FY runs 1 July -> 30 June; a date in
 * Jan-Jun belongs to the FY that started 1 July of the previous calendar year.
 */

export function financialYearStartOf(date: Date): Date {
  const year = date.getUTCMonth() >= 6 ? date.getUTCFullYear() : date.getUTCFullYear() - 1;
  return new Date(Date.UTC(year, 6, 1));
}

export function financialYearEndOf(date: Date): Date {
  const start = financialYearStartOf(date);
  return new Date(Date.UTC(start.getUTCFullYear() + 1, 5, 30));
}

/** e.g. "FY2025-26" */
export function financialYearLabel(date: Date): string {
  const start = financialYearStartOf(date);
  const startYear = start.getUTCFullYear();
  return `FY${startYear}-${String(startYear + 1).slice(-2)}`;
}

/** "2025-2026" - the query-param shape the backend's /portfolio/fy-report endpoint expects. */
export function financialYearParam(date: Date): string {
  const start = financialYearStartOf(date);
  return `${start.getUTCFullYear()}-${start.getUTCFullYear() + 1}`;
}

export interface FinancialYearOption {
  param: string; // "2025-2026"
  label: string; // "FY2025-26"
}

/** Most recent `count` financial years, current one first. */
export function getRecentFinancialYears(count: number, now: Date = new Date()): FinancialYearOption[] {
  const currentStart = financialYearStartOf(now);
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(Date.UTC(currentStart.getUTCFullYear() - i, 6, 1));
    return { param: financialYearParam(start), label: financialYearLabel(start) };
  });
}

export function daysUntilFinancialYearEnd(now: Date = new Date()): number {
  const end = financialYearEndOf(now);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((end.getTime() - now.getTime()) / msPerDay);
}
