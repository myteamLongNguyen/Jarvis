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
