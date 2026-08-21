import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import {
  useGetPropertyQuery,
  useGetPropertySummaryQuery,
  useGetPropertyReturnQuery,
  useGetPropertyInvoicesQuery,
  useGetLeasesQuery,
  useGetTenantsQuery,
  useGetRentalIncomesQuery,
  useGetDepreciationSchedulesQuery,
  useDeleteDepreciationScheduleMutation,
  useDeletePropertyMutation,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import StatCard from '../../components/StatCard';
import StatCardGrid from '../../components/StatCardGrid';
import PropertyFilesSection from './PropertyFilesSection';
import { formatDate, formatMoney, formatPercent } from '../../utils/format';

type Tab = 'summary' | 'return' | 'invoices' | 'leases' | 'income' | 'depreciation' | 'files';

const TAB_LABELS: Record<Tab, string> = {
  summary: 'Summary',
  return: 'Return',
  invoices: 'Invoices',
  leases: 'Leases',
  income: 'Income',
  depreciation: 'Depreciation',
  files: 'Files',
};

interface Props {
  id: string;
  onEdit: () => void;
  onDeleted: () => void;
  /** Leases/Income/Depreciation tab callbacks — only provided for investment properties, omit from personal-property screens. */
  onNewLease?: () => void;
  onOpenLease?: (leaseId: string) => void;
  onNewRentalIncome?: () => void;
  onOpenRentalIncome?: (rentalIncomeId: string) => void;
  onNewDepreciationSchedule?: () => void;
  onOpenDepreciationSchedule?: (depreciationScheduleId: string) => void;
}

export default function PropertyDetailPane({
  id,
  onEdit,
  onDeleted,
  onNewLease,
  onOpenLease,
  onNewRentalIncome,
  onOpenRentalIncome,
  onNewDepreciationSchedule,
  onOpenDepreciationSchedule,
}: Props) {
  const [tab, setTab] = useState<Tab>('summary');
  const [showAllSummary, setShowAllSummary] = useState(true);
  const [showAllReturn, setShowAllReturn] = useState(true);

  const property = useGetPropertyQuery(id);
  const summary = useGetPropertySummaryQuery(id);
  const propertyReturn = useGetPropertyReturnQuery({ id }, { skip: tab !== 'return' });
  const invoices = useGetPropertyInvoicesQuery({ id, offset: 0, limit: 20 }, { skip: tab !== 'invoices' });
  const leases = useGetLeasesQuery({ propertyId: id, limit: 50 }, { skip: tab !== 'leases' });
  const tenants = useGetTenantsQuery({ limit: 100 }, { skip: tab !== 'leases' });
  const rentalIncomes = useGetRentalIncomesQuery({ propertyId: id, limit: 50 }, { skip: tab !== 'income' });
  const depreciationSchedules = useGetDepreciationSchedulesQuery({ propertyId: id, limit: 50 }, { skip: tab !== 'depreciation' });
  const [deleteDepreciationSchedule] = useDeleteDepreciationScheduleMutation();
  const [deleteProperty, deleteState] = useDeletePropertyMutation();

  const tenantNameById = useMemo(() => {
    const map = new Map<string, string>();
    (tenants.data?.items ?? []).forEach((t) => map.set(t.id, t.name));
    return map;
  }, [tenants.data]);

  const isInvestment = property.data?.category === 'INVESTMENT';
  const visibleTabs: Tab[] = isInvestment
    ? ['summary', 'return', 'invoices', 'leases', 'income', 'depreciation', 'files']
    : ['summary', 'return', 'invoices', 'files'];

  const handleDeleteDepreciationSchedule = (scheduleId: string) => {
    Alert.alert('Delete depreciation entry?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDepreciationSchedule(scheduleId) },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete property?', 'This can be restored later if needed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteProperty(id);
          onDeleted();
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16 }}>
      <QueryState isLoading={property.isLoading} isError={property.isError} errorMessage="Couldn't load this property.">
        {property.data ? (
          <>
            <View className="mb-4 flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-2xl font-bold text-slate-900">{property.data.name}</Text>
                <Text className="mt-1 text-sm text-slate-500">
                  {property.data.addressLine1}
                  {property.data.addressLine2 ? `, ${property.data.addressLine2}` : ''}, {property.data.suburb}{' '}
                  {property.data.state} {property.data.postcode}
                </Text>
                <Text className="mt-1 text-xs font-medium text-slate-500">
                  {property.data.propertyType} · {property.data.status}
                </Text>
              </View>
              <View className="gap-2">
                <Pressable className="rounded-lg border border-slate-300 px-3 py-2" onPress={onEdit}>
                  <Text className="text-xs font-semibold text-slate-700">Edit</Text>
                </Pressable>
                <Pressable className="rounded-lg border border-red-300 px-3 py-2" onPress={handleDelete} disabled={deleteState.isLoading}>
                  <Text className="text-xs font-semibold text-red-600">Delete</Text>
                </Pressable>
              </View>
            </View>

            <View className="mb-4 flex-row rounded-lg bg-slate-200 p-1">
              {visibleTabs.map((t) => (
                <Pressable
                  key={t}
                  className={`flex-1 items-center rounded-md py-2 ${tab === t ? 'bg-white' : ''}`}
                  onPress={() => setTab(t)}
                >
                  <Text className={`text-xs font-semibold ${tab === t ? 'text-slate-900' : 'text-slate-500'}`}>{TAB_LABELS[t]}</Text>
                </Pressable>
              ))}
            </View>

            {tab === 'summary' ? (
              <QueryState isLoading={summary.isLoading} isError={summary.isError} errorMessage="Couldn't load summary.">
                {summary.data ? (
                  <>
                    <StatCardGrid minItemWidth={170}>
                      <StatCard label="Current annual rent" value={formatMoney(summary.data.currentAnnualRent)} />
                      <StatCard label="YTD net income" value={formatMoney(summary.data.ytdNetIncome)} />
                      <StatCard label="Yield on cost" value={formatPercent(summary.data.yieldOnCost)} />
                      <StatCard label="Active leases" value={String(summary.data.activeLeases)} />
                    </StatCardGrid>

                    <Pressable className="mt-3 self-start" onPress={() => setShowAllSummary((v) => !v)}>
                      <Text className="text-xs font-semibold text-slate-500">
                        {showAllSummary ? '▲ Show less' : '▼ Show more details'}
                      </Text>
                    </Pressable>

                    {showAllSummary ? (
                      <View className="mt-3">
                        <StatCardGrid>
                          <StatCard label="YTD gross income" value={formatMoney(summary.data.ytdGrossIncome)} />
                          <StatCard label="YTD maintenance" value={formatMoney(summary.data.ytdMaintenance)} />
                          <StatCard label="Yield on valuation" value={formatPercent(summary.data.yieldOnValuation)} />
                          <StatCard label="Last valuation" value={formatMoney(summary.data.lastValuation)} />
                          <StatCard label="Unpaid invoices" value={formatMoney(summary.data.unpaidInvoicesTotal)} />
                          <StatCard label="Next rent review" value={formatDate(summary.data.nextRentReview)} />
                          <StatCard label="Expiring leases" value={String(summary.data.expiringLeases)} />
                          <StatCard label="Purchase date" value={formatDate(property.data.purchaseDate)} />
                          <StatCard label="Purchase price" value={formatMoney(property.data.purchasePrice, property.data.purchaseCurrency)} />
                        </StatCardGrid>
                      </View>
                    ) : null}
                  </>
                ) : null}
              </QueryState>
            ) : null}

            {tab === 'return' ? (
              <QueryState isLoading={propertyReturn.isLoading} isError={propertyReturn.isError} errorMessage="Couldn't load return data.">
                {propertyReturn.data ? (
                  <>
                    <StatCardGrid minItemWidth={170}>
                      <StatCard label="Net yield on cost" value={formatPercent(propertyReturn.data.netYieldOnCost)} />
                      <StatCard label="Total return since purchase" value={formatMoney(propertyReturn.data.totalReturnSincePurchase)} />
                    </StatCardGrid>

                    <Pressable className="mt-3 self-start" onPress={() => setShowAllReturn((v) => !v)}>
                      <Text className="text-xs font-semibold text-slate-500">
                        {showAllReturn ? '▲ Show less' : '▼ Show more details'}
                      </Text>
                    </Pressable>

                    {showAllReturn ? (
                      <View className="mt-3">
                        <StatCardGrid>
                          <StatCard label="Gross yield on cost" value={formatPercent(propertyReturn.data.grossYieldOnCost)} />
                          <StatCard label="Gross yield on valuation" value={formatPercent(propertyReturn.data.grossYieldOnCurrentValuation)} />
                          <StatCard label="Net yield on valuation" value={formatPercent(propertyReturn.data.netYieldOnCurrentValuation)} />
                          <StatCard label="Cash-on-cash return" value={formatPercent(propertyReturn.data.cashOnCashReturn)} />
                        </StatCardGrid>
                      </View>
                    ) : null}
                  </>
                ) : null}
              </QueryState>
            ) : null}

            {tab === 'invoices' ? (
              <QueryState isLoading={invoices.isLoading} isError={invoices.isError} errorMessage="Couldn't load invoices.">
                {invoices.data && invoices.data.items.length > 0 ? (
                  <View className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {invoices.data.items.map((inv, index) => (
                      <View key={inv.id} className={`px-4 py-3 ${index > 0 ? 'border-t border-slate-100' : ''}`}>
                        <View className="flex-row items-center justify-between">
                          <Text className="flex-1 text-sm font-medium text-slate-800" numberOfLines={1}>
                            {inv.issuerName}
                          </Text>
                          <Text className="text-sm font-semibold text-slate-900">{formatMoney(inv.totalAmount, inv.currency)}</Text>
                        </View>
                        <Text className="mt-0.5 text-xs text-slate-500">
                          {inv.invoiceType} · {inv.status} · {formatDate(inv.issueDate)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-center text-sm text-slate-500">No invoices for this property.</Text>
                )}
              </QueryState>
            ) : null}

            {tab === 'leases' ? (
              <View>
                <Pressable
                  className="mb-3 items-center self-start rounded-lg bg-slate-900 px-3 py-2"
                  onPress={onNewLease}
                >
                  <Text className="text-xs font-semibold text-white">+ New lease</Text>
                </Pressable>
                <QueryState isLoading={leases.isLoading} isError={leases.isError} errorMessage="Couldn't load leases.">
                  {leases.data && leases.data.items.length > 0 ? (
                    <View className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {leases.data.items.map((l, index) => (
                        <Pressable
                          key={l.id}
                          className={`px-4 py-3 ${index > 0 ? 'border-t border-slate-100' : ''}`}
                          onPress={() => onOpenLease?.(l.id)}
                        >
                          <View className="flex-row items-center justify-between">
                            <Text className="flex-1 text-sm font-medium text-slate-800" numberOfLines={1}>
                              {tenantNameById.get(l.tenantId) ?? l.tenantId}
                            </Text>
                            <Text className="text-sm font-semibold text-slate-900">{formatMoney(l.baseRentAnnual)}</Text>
                          </View>
                          <Text className="mt-0.5 text-xs text-slate-500">
                            {l.status} · {formatDate(l.commencementDate)} → {formatDate(l.expiryDate)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-center text-sm text-slate-500">No leases for this property yet.</Text>
                  )}
                </QueryState>
              </View>
            ) : null}

            {tab === 'income' ? (
              <View>
                <Pressable
                  className="mb-3 items-center self-start rounded-lg bg-slate-900 px-3 py-2"
                  onPress={onNewRentalIncome}
                >
                  <Text className="text-xs font-semibold text-white">+ Record income</Text>
                </Pressable>
                <QueryState isLoading={rentalIncomes.isLoading} isError={rentalIncomes.isError} errorMessage="Couldn't load rental income.">
                  {rentalIncomes.data && rentalIncomes.data.items.length > 0 ? (
                    <View className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {rentalIncomes.data.items.map((r, index) => (
                        <Pressable
                          key={r.id}
                          className={`px-4 py-3 ${index > 0 ? 'border-t border-slate-100' : ''}`}
                          onPress={() => onOpenRentalIncome?.(r.id)}
                        >
                          <View className="flex-row items-center justify-between">
                            <Text className="flex-1 text-sm font-medium text-slate-800" numberOfLines={1}>
                              {formatDate(r.periodStart)} – {formatDate(r.periodEnd)}
                            </Text>
                            <Text className="text-sm font-semibold text-slate-900">{formatMoney(r.netAmount)}</Text>
                          </View>
                          <Text className="mt-0.5 text-xs text-slate-500">
                            Gross {formatMoney(r.grossAmount)} · {r.status}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-center text-sm text-slate-500">No rental income recorded for this property yet.</Text>
                  )}
                </QueryState>
              </View>
            ) : null}

            {tab === 'depreciation' ? (
              <View>
                <Pressable
                  className="mb-3 items-center self-start rounded-lg bg-slate-900 px-3 py-2"
                  onPress={onNewDepreciationSchedule}
                >
                  <Text className="text-xs font-semibold text-white">+ New entry</Text>
                </Pressable>
                <QueryState
                  isLoading={depreciationSchedules.isLoading}
                  isError={depreciationSchedules.isError}
                  errorMessage="Couldn't load depreciation schedule."
                >
                  {depreciationSchedules.data && depreciationSchedules.data.items.length > 0 ? (
                    <View className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {depreciationSchedules.data.items.map((d, index) => (
                        <View key={d.id} className={`px-4 py-3 ${index > 0 ? 'border-t border-slate-100' : ''}`}>
                          <Pressable onPress={() => onOpenDepreciationSchedule?.(d.id)}>
                            <View className="flex-row items-center justify-between">
                              <Text className="flex-1 pr-3 text-sm font-medium text-slate-800" numberOfLines={1}>
                                {formatDate(d.financialYearStart)} – {formatDate(d.financialYearEnd)}
                              </Text>
                              <Text className="text-sm font-semibold text-slate-900">{formatMoney(d.totalAmount)}</Text>
                            </View>
                            <Text className="mt-0.5 text-xs text-slate-500">
                              {d.method}
                              {d.division40Amount ? ` · Div 40 ${formatMoney(d.division40Amount)}` : ''}
                              {d.division43Amount ? ` · Div 43 ${formatMoney(d.division43Amount)}` : ''}
                            </Text>
                          </Pressable>
                          <Pressable className="mt-1 self-start" onPress={() => handleDeleteDepreciationSchedule(d.id)}>
                            <Text className="text-xs font-semibold text-red-600">Delete</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-center text-sm text-slate-500">No depreciation schedule entries yet.</Text>
                  )}
                </QueryState>
              </View>
            ) : null}

            {tab === 'files' ? <PropertyFilesSection propertyId={id} /> : null}
          </>
        ) : null}
      </QueryState>
    </ScrollView>
  );
}
