export const REMINDER_CATEGORIES = ['LEASE_EXPIRY', 'RENT_REVIEW', 'COMPLIANCE_RENEWAL', 'UNPAID_RENTAL'] as const;
export type ReminderCategory = (typeof REMINDER_CATEGORIES)[number];

export const REMINDER_SEVERITIES = ['OVERDUE', 'DUE_SOON'] as const;
export type ReminderSeverity = (typeof REMINDER_SEVERITIES)[number];

export interface ReminderItem {
  id: string;
  category: ReminderCategory;
  severity: ReminderSeverity;
  title: string;
  detail: string;
  dueDate?: string;
  propertyId?: string;
  propertyName?: string;
  entityId?: string;
  amount?: number;
}

export interface ReminderCounts {
  leaseExpiries: number;
  rentReviews: number;
  complianceRenewals: number;
  unpaidRental: number;
  overdueTotal: number;
}

export interface ReminderSummary {
  asOf: string;
  windowDays: number;
  counts: ReminderCounts;
  items: ReminderItem[];
}

export interface ReminderQueryParams {
  windowDays?: number;
}
