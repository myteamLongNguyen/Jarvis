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
import type { DateRangeParams, PortfolioSummary, PropertyReturnRanking, RankedProperty } from '../types/portfolio';
import type {
  ClassifyInvoiceInput,
  GeneratePostingsResult,
  Invoice,
  InvoiceFormInput,
  InvoiceListParams,
  PayInvoiceInput,
  PropertyInvoiceListParams,
} from '../types/invoice';
import type { DocumentListParams, DocumentUploadInput, PropertyDocument } from '../types/document';

const unwrap = <T>(res: SingleResponse<T>) => res.data as T;

export const jarvisApi = createApi({
  reducerPath: 'jarvisApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Property', 'OwningEntity', 'ManagingAgent', 'Document', 'Invoice'],
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
      invalidatesTags: (_result, _error, id) => [{ type: 'Invoice', id }],
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
      invalidatesTags: [{ type: 'Document', id: 'LIST' }],
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({ url: `/documents/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Document', id },
        { type: 'Document', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPortfolioSummaryQuery,
  useGetIncomeByPropertyQuery,
  useGetReturnByPropertyQuery,
  useGetMaintenanceByPropertyQuery,
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
} = jarvisApi;
