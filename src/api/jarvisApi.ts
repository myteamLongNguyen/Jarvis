import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { ListResponse, SingleResponse } from '../types/api';
import type {
  Property,
  PropertyFormInput,
  PropertyListParams,
  PropertyReturn,
  PropertySummary,
} from '../types/property';
import type { OwningEntity, OwningEntityFormInput, OwningEntityListParams } from '../types/owning-entity';
import type { ManagingAgent, ManagingAgentFormInput, ManagingAgentListParams } from '../types/managing-agent';
import type {
  DateRangeParams,
  PortfolioSummary,
  PropertyReturnRanking,
  RankedProperty,
  FinancialYearReport,
  FinancialYearReportParams,
} from '../types/portfolio';
import type {
  DepreciationSchedule,
  DepreciationScheduleFormInput,
  DepreciationScheduleListParams,
} from '../types/depreciation-schedule';
import type {
  ClassifyInvoiceInput,
  GeneratePostingsResult,
  Invoice,
  InvoiceFormInput,
  InvoiceListParams,
  InvoiceScanResult,
  PayInvoiceInput,
  PropertyInvoiceListParams,
} from '../types/invoice';
import type { DocumentListParams, DocumentUploadInput, PropertyDocument } from '../types/document';
import type { SmartScanFile, SmartScanResult } from '../types/smart-scan';
import type { Tenant, TenantFormInput, TenantListParams } from '../types/tenant';
import type { Lease, LeaseFormInput, LeaseListParams } from '../types/lease';
import type { RentReview, RentReviewFormInput, RentReviewListParams, ScheduledReview } from '../types/rent-review';
import type { RentalIncome, RentalIncomeFormInput, RentalIncomeListParams } from '../types/rental-income';
import type { ReminderQueryParams, ReminderSummary } from '../types/reminder';

// Document scans read the file with two model calls, which routinely takes 20-40s
// on a long lease or statement — far past the api client's 15s default.
const SCAN_TIMEOUT_MS = 120_000;

const unwrap = <T>(res: SingleResponse<T>) => res.data as T;

export const jarvisApi = createApi({
  reducerPath: 'jarvisApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Property',
    'OwningEntity',
    'ManagingAgent',
    'Document',
    'Invoice',
    'Tenant',
    'Lease',
    'RentReview',
    'RentalIncome',
    'DepreciationSchedule',
    'Reminder',
  ],
  endpoints: (builder) => ({
    // Portfolio
    getPortfolioSummary: builder.query<PortfolioSummary, void>({
      query: () => ({ url: '/portfolio/summary', method: 'GET' }),
      transformResponse: unwrap<PortfolioSummary>,
    }),
    getIncomeByProperty: builder.query<RankedProperty[], DateRangeParams | void>({
      query: (params) => ({ url: '/portfolio/income-by-property', method: 'GET', params: params ?? undefined }),
      transformResponse: (res: SingleResponse<RankedProperty[]>) => res.data ?? [],
    }),
    getReturnByProperty: builder.query<PropertyReturnRanking[], { asOf?: string } | void>({
      query: (params) => ({ url: '/portfolio/return-by-property', method: 'GET', params: params ?? undefined }),
      transformResponse: (res: SingleResponse<PropertyReturnRanking[]>) => res.data ?? [],
    }),
    getFinancialYearReport: builder.query<FinancialYearReport, FinancialYearReportParams | void>({
      query: (params) => ({ url: '/portfolio/fy-report', method: 'GET', params: params ?? undefined }),
      transformResponse: unwrap<FinancialYearReport>,
    }),
    getDepreciationSchedules: builder.query<ListResponse<DepreciationSchedule>, DepreciationScheduleListParams | void>({
      query: (params) => ({ url: '/depreciation-schedules', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((d) => ({ type: 'DepreciationSchedule' as const, id: d.id })),
              { type: 'DepreciationSchedule' as const, id: 'LIST' },
            ]
          : [{ type: 'DepreciationSchedule' as const, id: 'LIST' }],
    }),
    getDepreciationSchedule: builder.query<DepreciationSchedule, string>({
      query: (id) => ({ url: `/depreciation-schedules/${id}`, method: 'GET' }),
      transformResponse: unwrap<DepreciationSchedule>,
      providesTags: (_result, _error, id) => [{ type: 'DepreciationSchedule', id }],
    }),
    createDepreciationSchedule: builder.mutation<DepreciationSchedule, DepreciationScheduleFormInput>({
      query: (body) => ({ url: '/depreciation-schedules', method: 'POST', data: body }),
      transformResponse: unwrap<DepreciationSchedule>,
      invalidatesTags: [{ type: 'DepreciationSchedule', id: 'LIST' }],
    }),
    updateDepreciationSchedule: builder.mutation<DepreciationSchedule, { id: string; body: Partial<DepreciationScheduleFormInput> }>({
      query: ({ id, body }) => ({ url: `/depreciation-schedules/${id}`, method: 'PATCH', data: body }),
      transformResponse: unwrap<DepreciationSchedule>,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'DepreciationSchedule', id },
        { type: 'DepreciationSchedule', id: 'LIST' },
      ],
    }),
    deleteDepreciationSchedule: builder.mutation<void, string>({
      query: (id) => ({ url: `/depreciation-schedules/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'DepreciationSchedule', id },
        { type: 'DepreciationSchedule', id: 'LIST' },
      ],
    }),
    getMaintenanceByProperty: builder.query<RankedProperty[], DateRangeParams | void>({
      query: (params) => ({ url: '/portfolio/maintenance-by-property', method: 'GET', params: params ?? undefined }),
      transformResponse: (res: SingleResponse<RankedProperty[]>) => res.data ?? [],
    }),

    // Properties
    getProperties: builder.query<ListResponse<Property>, PropertyListParams | void>({
      query: (params) => ({ url: '/properties', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.items.map((p) => ({ type: 'Property' as const, id: p.id })), { type: 'Property' as const, id: 'LIST' }]
          : [{ type: 'Property' as const, id: 'LIST' }],
    }),
    getProperty: builder.query<Property, string>({
      query: (id) => ({ url: `/properties/${id}`, method: 'GET' }),
      transformResponse: unwrap<Property>,
      providesTags: (_result, _error, id) => [{ type: 'Property', id }],
    }),
    createProperty: builder.mutation<Property, PropertyFormInput>({
      query: (body) => ({ url: '/properties', method: 'POST', data: body }),
      transformResponse: unwrap<Property>,
      invalidatesTags: [{ type: 'Property', id: 'LIST' }],
    }),
    updateProperty: builder.mutation<Property, { id: string; body: Partial<PropertyFormInput> }>({
      query: ({ id, body }) => ({ url: `/properties/${id}`, method: 'PATCH', data: body }),
      transformResponse: unwrap<Property>,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Property', id },
        { type: 'Property', id: 'LIST' },
      ],
    }),
    deleteProperty: builder.mutation<void, string>({
      query: (id) => ({ url: `/properties/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Property', id },
        { type: 'Property', id: 'LIST' },
      ],
    }),
    getPropertySummary: builder.query<PropertySummary, string>({
      query: (id) => ({ url: `/properties/${id}/summary`, method: 'GET' }),
      transformResponse: unwrap<PropertySummary>,
      providesTags: (_result, _error, id) => [{ type: 'Property', id: `${id}-summary` }],
    }),
    getPropertyReturn: builder.query<PropertyReturn, { id: string; asOf?: string }>({
      query: ({ id, asOf }) => ({ url: `/properties/${id}/return`, method: 'GET', params: asOf ? { asOf } : undefined }),
      transformResponse: unwrap<PropertyReturn>,
    }),
    getPropertyInvoices: builder.query<ListResponse<Invoice>, { id: string } & PropertyInvoiceListParams>({
      query: ({ id, ...params }) => ({ url: `/properties/${id}/invoices`, method: 'GET', params }),
    }),

    // Invoices
    getInvoices: builder.query<ListResponse<Invoice>, InvoiceListParams | void>({
      query: (params) => ({ url: '/invoices', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.items.map((i) => ({ type: 'Invoice' as const, id: i.id })), { type: 'Invoice' as const, id: 'LIST' }]
          : [{ type: 'Invoice' as const, id: 'LIST' }],
    }),
    getInvoice: builder.query<Invoice, string>({
      query: (id) => ({ url: `/invoices/${id}`, method: 'GET' }),
      transformResponse: unwrap<Invoice>,
      providesTags: (_result, _error, id) => [{ type: 'Invoice', id }],
    }),
    createInvoice: builder.mutation<Invoice, InvoiceFormInput>({
      query: (body) => ({ url: '/invoices', method: 'POST', data: body }),
      transformResponse: unwrap<Invoice>,
      invalidatesTags: [{ type: 'Invoice', id: 'LIST' }],
    }),
    // Smart Scan: one AI read of any property document — classifies it, matches a
    // property, and returns the pre-filled payload for whichever form it belongs to.
    smartScan: builder.mutation<SmartScanResult, SmartScanFile & { scanId?: string }>({
      query: ({ scanId, ...file }) => {
        const formData = new FormData();
        formData.append('file', file as unknown as Blob);
        // Lets the server publish stage updates to the progress stream the screen
        // is listening on. Omitting it just means no progress, not a failed scan.
        if (scanId) formData.append('scanId', scanId);
        return { url: '/smart-scan', method: 'POST', data: formData, timeout: SCAN_TIMEOUT_MS };
      },
      transformResponse: unwrap<SmartScanResult>,
    }),
    scanInvoiceDocument: builder.mutation<InvoiceScanResult, { uri: string; name: string; type: string }>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file as unknown as Blob);
        return { url: '/invoices/scan', method: 'POST', data: formData, timeout: SCAN_TIMEOUT_MS };
      },
      transformResponse: unwrap<InvoiceScanResult>,
    }),
    updateInvoice: builder.mutation<Invoice, { id: string; body: Partial<InvoiceFormInput> }>({
      query: ({ id, body }) => ({ url: `/invoices/${id}`, method: 'PATCH', data: body }),
      transformResponse: unwrap<Invoice>,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),
    deleteInvoice: builder.mutation<void, string>({
      query: (id) => ({ url: `/invoices/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),
    classifyInvoice: builder.mutation<Invoice, { id: string; body: ClassifyInvoiceInput }>({
      query: ({ id, body }) => ({ url: `/invoices/${id}/classify`, method: 'PATCH', data: body }),
      transformResponse: unwrap<Invoice>,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),
    generateInvoicePostings: builder.mutation<GeneratePostingsResult, string>({
      query: (id) => ({ url: `/invoices/${id}/generate-postings`, method: 'POST' }),
      transformResponse: unwrap<GeneratePostingsResult>,
      invalidatesTags: (_result, _error, id) => [{ type: 'Invoice', id }, { type: 'Reminder', id: 'LIST' }],
    }),
    payInvoice: builder.mutation<Invoice, { id: string; body: PayInvoiceInput }>({
      query: ({ id, body }) => ({ url: `/invoices/${id}/pay`, method: 'PATCH', data: body }),
      transformResponse: unwrap<Invoice>,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),

    // Owning entities
    getOwningEntities: builder.query<ListResponse<OwningEntity>, OwningEntityListParams | void>({
      query: (params) => ({ url: '/owning-entities', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.items.map((e) => ({ type: 'OwningEntity' as const, id: e.id })), { type: 'OwningEntity' as const, id: 'LIST' }]
          : [{ type: 'OwningEntity' as const, id: 'LIST' }],
    }),
    getOwningEntity: builder.query<OwningEntity, string>({
      query: (id) => ({ url: `/owning-entities/${id}`, method: 'GET' }),
      transformResponse: unwrap<OwningEntity>,
      providesTags: (_result, _error, id) => [{ type: 'OwningEntity', id }],
    }),
    createOwningEntity: builder.mutation<OwningEntity, OwningEntityFormInput>({
      query: (body) => ({ url: '/owning-entities', method: 'POST', data: body }),
      transformResponse: unwrap<OwningEntity>,
      invalidatesTags: [{ type: 'OwningEntity', id: 'LIST' }],
    }),
    updateOwningEntity: builder.mutation<OwningEntity, { id: string; body: Partial<OwningEntityFormInput> }>({
      query: ({ id, body }) => ({ url: `/owning-entities/${id}`, method: 'PATCH', data: body }),
      transformResponse: unwrap<OwningEntity>,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'OwningEntity', id },
        { type: 'OwningEntity', id: 'LIST' },
      ],
    }),
    deleteOwningEntity: builder.mutation<void, string>({
      query: (id) => ({ url: `/owning-entities/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'OwningEntity', id },
        { type: 'OwningEntity', id: 'LIST' },
      ],
    }),

    // Managing agents
    getManagingAgents: builder.query<ListResponse<ManagingAgent>, ManagingAgentListParams | void>({
      query: (params) => ({ url: '/managing-agents', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.items.map((a) => ({ type: 'ManagingAgent' as const, id: a.id })), { type: 'ManagingAgent' as const, id: 'LIST' }]
          : [{ type: 'ManagingAgent' as const, id: 'LIST' }],
    }),
    getManagingAgent: builder.query<ManagingAgent, string>({
      query: (id) => ({ url: `/managing-agents/${id}`, method: 'GET' }),
      transformResponse: unwrap<ManagingAgent>,
      providesTags: (_result, _error, id) => [{ type: 'ManagingAgent', id }],
    }),
    createManagingAgent: builder.mutation<ManagingAgent, ManagingAgentFormInput>({
      query: (body) => ({ url: '/managing-agents', method: 'POST', data: body }),
      transformResponse: unwrap<ManagingAgent>,
      invalidatesTags: [{ type: 'ManagingAgent', id: 'LIST' }],
    }),
    updateManagingAgent: builder.mutation<ManagingAgent, { id: string; body: Partial<ManagingAgentFormInput> }>({
      query: ({ id, body }) => ({ url: `/managing-agents/${id}`, method: 'PATCH', data: body }),
      transformResponse: unwrap<ManagingAgent>,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ManagingAgent', id },
        { type: 'ManagingAgent', id: 'LIST' },
      ],
    }),
    deleteManagingAgent: builder.mutation<void, string>({
      query: (id) => ({ url: `/managing-agents/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ManagingAgent', id },
        { type: 'ManagingAgent', id: 'LIST' },
      ],
    }),

    // Documents & photos
    getDocuments: builder.query<ListResponse<PropertyDocument>, DocumentListParams | void>({
      query: (params) => ({ url: '/documents', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.items.map((d) => ({ type: 'Document' as const, id: d.id })), { type: 'Document' as const, id: 'LIST' }]
          : [{ type: 'Document' as const, id: 'LIST' }],
    }),
    uploadDocument: builder.mutation<PropertyDocument, DocumentUploadInput>({
      query: ({ file, ...fields }) => {
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined) formData.append(key, String(value));
        });
        formData.append('file', file as unknown as Blob);
        return { url: '/documents/upload', method: 'POST', data: formData };
      },
      transformResponse: unwrap<PropertyDocument>,
      invalidatesTags: [
        { type: 'Document', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
      ],
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({ url: `/documents/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Document', id },
        { type: 'Document', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
      ],
    }),

    // Tenants
    getTenants: builder.query<ListResponse<Tenant>, TenantListParams | void>({
      query: (params) => ({ url: '/tenants', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.items.map((t) => ({ type: 'Tenant' as const, id: t.id })), { type: 'Tenant' as const, id: 'LIST' }]
          : [{ type: 'Tenant' as const, id: 'LIST' }],
    }),
    getTenant: builder.query<Tenant, string>({
      query: (id) => ({ url: `/tenants/${id}`, method: 'GET' }),
      transformResponse: unwrap<Tenant>,
      providesTags: (_result, _error, id) => [{ type: 'Tenant', id }],
    }),
    createTenant: builder.mutation<Tenant, TenantFormInput>({
      query: (body) => ({ url: '/tenants', method: 'POST', data: body }),
      transformResponse: unwrap<Tenant>,
      invalidatesTags: [{ type: 'Tenant', id: 'LIST' }],
    }),
    updateTenant: builder.mutation<Tenant, { id: string; body: Partial<TenantFormInput> }>({
      query: ({ id, body }) => ({ url: `/tenants/${id}`, method: 'PATCH', data: body }),
      transformResponse: unwrap<Tenant>,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Tenant', id },
        { type: 'Tenant', id: 'LIST' },
      ],
    }),
    deleteTenant: builder.mutation<void, string>({
      query: (id) => ({ url: `/tenants/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Tenant', id },
        { type: 'Tenant', id: 'LIST' },
      ],
    }),

    // Leases
    getLeases: builder.query<ListResponse<Lease>, LeaseListParams | void>({
      query: (params) => ({ url: '/leases', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.items.map((l) => ({ type: 'Lease' as const, id: l.id })), { type: 'Lease' as const, id: 'LIST' }]
          : [{ type: 'Lease' as const, id: 'LIST' }],
    }),
    getLease: builder.query<Lease, string>({
      query: (id) => ({ url: `/leases/${id}`, method: 'GET' }),
      transformResponse: unwrap<Lease>,
      providesTags: (_result, _error, id) => [{ type: 'Lease', id }],
    }),
    createLease: builder.mutation<Lease, LeaseFormInput>({
      query: (body) => ({ url: '/leases', method: 'POST', data: body }),
      transformResponse: unwrap<Lease>,
      invalidatesTags: (result) => [
        { type: 'Lease', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
        ...(result ? [{ type: 'Property' as const, id: result.propertyId }] : []),
      ],
    }),
    updateLease: builder.mutation<Lease, { id: string; body: Partial<LeaseFormInput> }>({
      query: ({ id, body }) => ({ url: `/leases/${id}`, method: 'PATCH', data: body }),
      transformResponse: unwrap<Lease>,
      invalidatesTags: (result, _error, { id }) => [
        { type: 'Lease', id },
        { type: 'Lease', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
        ...(result ? [{ type: 'Property' as const, id: result.propertyId }] : []),
      ],
    }),
    deleteLease: builder.mutation<void, { id: string; propertyId: string }>({
      query: ({ id }) => ({ url: `/leases/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { id, propertyId }) => [
        { type: 'Lease', id },
        { type: 'Lease', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
        { type: 'Property', id: propertyId },
      ],
    }),

    // Rent reviews
    getRentReviews: builder.query<ListResponse<RentReview>, RentReviewListParams | void>({
      query: (params) => ({ url: '/rent-reviews', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.items.map((r) => ({ type: 'RentReview' as const, id: r.id })), { type: 'RentReview' as const, id: 'LIST' }]
          : [{ type: 'RentReview' as const, id: 'LIST' }],
    }),
    getRentReview: builder.query<RentReview, string>({
      query: (id) => ({ url: `/rent-reviews/${id}`, method: 'GET' }),
      transformResponse: unwrap<RentReview>,
      providesTags: (_result, _error, id) => [{ type: 'RentReview', id }],
    }),
    // The schedule a lease implies. Read-only: nothing is saved until the user confirms.
    getReviewSchedule: builder.query<ScheduledReview[], string>({
      query: (leaseId) => ({ url: `/rent-reviews/schedule/${leaseId}`, method: 'GET' }),
      transformResponse: unwrap<ScheduledReview[]>,
      providesTags: [{ type: 'RentReview', id: 'SCHEDULE' }],
    }),
    generateReviewSchedule: builder.mutation<{ created: RentReview[]; skipped: number }, string>({
      query: (leaseId) => ({ url: `/rent-reviews/schedule/${leaseId}`, method: 'POST' }),
      transformResponse: unwrap<{ created: RentReview[]; skipped: number }>,
      invalidatesTags: [{ type: 'RentReview', id: 'LIST' }, { type: 'Property', id: 'LIST' }],
    }),
    createRentReview: builder.mutation<RentReview, RentReviewFormInput>({
      query: (body) => ({ url: '/rent-reviews', method: 'POST', data: body }),
      transformResponse: unwrap<RentReview>,
      invalidatesTags: (result) => [
        { type: 'RentReview', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
        ...(result ? [{ type: 'Lease' as const, id: result.leaseId }] : []),
      ],
    }),
    updateRentReview: builder.mutation<RentReview, { id: string; body: Partial<RentReviewFormInput> }>({
      query: ({ id, body }) => ({ url: `/rent-reviews/${id}`, method: 'PATCH', data: body }),
      transformResponse: unwrap<RentReview>,
      invalidatesTags: (result, _error, { id }) => [
        { type: 'RentReview', id },
        { type: 'RentReview', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
        ...(result ? [{ type: 'Lease' as const, id: result.leaseId }] : []),
      ],
    }),
    deleteRentReview: builder.mutation<void, { id: string; leaseId: string }>({
      query: ({ id }) => ({ url: `/rent-reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { id, leaseId }) => [
        { type: 'RentReview', id },
        { type: 'RentReview', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
        { type: 'Lease', id: leaseId },
      ],
    }),

    // Rental income
    getRentalIncomes: builder.query<ListResponse<RentalIncome>, RentalIncomeListParams | void>({
      query: (params) => ({ url: '/rental-incomes', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [...result.items.map((r) => ({ type: 'RentalIncome' as const, id: r.id })), { type: 'RentalIncome' as const, id: 'LIST' }]
          : [{ type: 'RentalIncome' as const, id: 'LIST' }],
    }),
    getRentalIncome: builder.query<RentalIncome, string>({
      query: (id) => ({ url: `/rental-incomes/${id}`, method: 'GET' }),
      transformResponse: unwrap<RentalIncome>,
      providesTags: (_result, _error, id) => [{ type: 'RentalIncome', id }],
    }),
    createRentalIncome: builder.mutation<RentalIncome, RentalIncomeFormInput>({
      query: (body) => ({ url: '/rental-incomes', method: 'POST', data: body }),
      transformResponse: unwrap<RentalIncome>,
      invalidatesTags: (result) => [
        { type: 'RentalIncome', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
        ...(result ? [{ type: 'Property' as const, id: result.propertyId }] : []),
      ],
    }),
    updateRentalIncome: builder.mutation<RentalIncome, { id: string; body: Partial<RentalIncomeFormInput> }>({
      query: ({ id, body }) => ({ url: `/rental-incomes/${id}`, method: 'PATCH', data: body }),
      transformResponse: unwrap<RentalIncome>,
      invalidatesTags: (result, _error, { id }) => [
        { type: 'RentalIncome', id },
        { type: 'RentalIncome', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
        ...(result ? [{ type: 'Property' as const, id: result.propertyId }] : []),
      ],
    }),
    deleteRentalIncome: builder.mutation<void, { id: string; propertyId: string }>({
      query: ({ id }) => ({ url: `/rental-incomes/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { id, propertyId }) => [
        { type: 'RentalIncome', id },
        { type: 'RentalIncome', id: 'LIST' },
        { type: 'Reminder', id: 'LIST' },
        { type: 'Property', id: propertyId },
      ],
    }),

    // Reminders
    getReminders: builder.query<ReminderSummary, ReminderQueryParams | void>({
      query: (params) => ({ url: '/reminders', method: 'GET', params: params ?? undefined }),
      transformResponse: unwrap<ReminderSummary>,
      providesTags: [{ type: 'Reminder' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPortfolioSummaryQuery,
  useGetIncomeByPropertyQuery,
  useGetReturnByPropertyQuery,
  useGetMaintenanceByPropertyQuery,
  useGetFinancialYearReportQuery,
  useGetDepreciationSchedulesQuery,
  useGetDepreciationScheduleQuery,
  useCreateDepreciationScheduleMutation,
  useUpdateDepreciationScheduleMutation,
  useDeleteDepreciationScheduleMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetPropertySummaryQuery,
  useGetPropertyReturnQuery,
  useGetPropertyInvoicesQuery,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useScanInvoiceDocumentMutation,
  useSmartScanMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useClassifyInvoiceMutation,
  useGenerateInvoicePostingsMutation,
  usePayInvoiceMutation,
  useGetOwningEntitiesQuery,
  useGetOwningEntityQuery,
  useCreateOwningEntityMutation,
  useUpdateOwningEntityMutation,
  useDeleteOwningEntityMutation,
  useGetManagingAgentsQuery,
  useGetManagingAgentQuery,
  useCreateManagingAgentMutation,
  useUpdateManagingAgentMutation,
  useDeleteManagingAgentMutation,
  useGetDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useGetTenantsQuery,
  useGetTenantQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useGetLeasesQuery,
  useGetLeaseQuery,
  useCreateLeaseMutation,
  useUpdateLeaseMutation,
  useDeleteLeaseMutation,
  useGetRentReviewsQuery,
  useGetRentReviewQuery,
  useCreateRentReviewMutation,
  useGetReviewScheduleQuery,
  useGenerateReviewScheduleMutation,
  useUpdateRentReviewMutation,
  useDeleteRentReviewMutation,
  useGetRentalIncomesQuery,
  useGetRentalIncomeQuery,
  useCreateRentalIncomeMutation,
  useUpdateRentalIncomeMutation,
  useDeleteRentalIncomeMutation,
  useGetRemindersQuery,
} = jarvisApi;
