export interface PortfolioSummary {
  propertyCount: number;
  portfolioValue: number;
  ytdGrossIncome: number;
  ytdNetIncome: number;
  ytdMaintenanceSpend: number;
  blendedYieldOnCost: number;
  blendedYieldOnValuation?: number;
  unpaidInvoicesTotal: number;
  overdueInvoicesCount: number;
}

export interface RankedProperty {
  propertyId: string;
  propertyName: string;
  value: number;
}

export type PropertyReturnRanking = RankedProperty;

export interface DateRangeParams {
  from?: string;
  to?: string;
}

export interface FinancialYearReportLine {
  propertyId: string;
  propertyName: string;
  grossIncome: number;
  netIncome: number;
  expensesTotal: number;
  depreciationDiminishingValue?: number;
  depreciationPrimeCost?: number;
  openingValuation?: number;
  closingValuation?: number;
}

export interface FinancialYearReportTotals {
  grossIncome: number;
  netIncome: number;
  expensesTotal: number;
  depreciationDiminishingValue: number;
  depreciationPrimeCost: number;
}

export interface FinancialYearReport {
  financialYearLabel: string;
  periodStart: string;
  periodEnd: string;
  properties: FinancialYearReportLine[];
  totals: FinancialYearReportTotals;
}

export interface FinancialYearReportParams {
  fy?: string; // "2025-2026"
  includePersonal?: boolean;
}
