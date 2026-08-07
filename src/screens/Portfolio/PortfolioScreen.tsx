import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import {
  useGetPortfolioSummaryQuery,
  useGetIncomeByPropertyQuery,
  useGetReturnByPropertyQuery,
  useGetMaintenanceByPropertyQuery,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import StatCard from '../../components/StatCard';
import StatCardGrid from '../../components/StatCardGrid';
import RankedBarList from '../../components/RankedBarList';
import { formatMoney, formatPercent } from '../../utils/format';

function RankedSection<T extends { propertyId: string; propertyName: string; value: number }>({
  title,
  items,
  renderValue,
}: {
  title: string;
  items: T[];
  renderValue: (item: T) => string;
}) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-slate-900">{title}</Text>
      {items.length === 0 ? (
        <Text className="text-sm text-slate-500">No data yet.</Text>
      ) : (
        <View className="rounded-xl border border-slate-200 bg-white p-4">
          <RankedBarList
            items={items.slice(0, 5).map((item) => ({
              id: item.propertyId,
              label: item.propertyName,
              value: item.value,
              displayValue: renderValue(item),
            }))}
          />
        </View>
      )}
    </View>
  );
}

export default function PortfolioScreen() {
  const [showMoreMetrics, setShowMoreMetrics] = useState(false);
  const summary = useGetPortfolioSummaryQuery();
  const income = useGetIncomeByPropertyQuery();
  const returns = useGetReturnByPropertyQuery();
  const maintenance = useGetMaintenanceByPropertyQuery();

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16 }}>
      <QueryState isLoading={summary.isLoading} isError={summary.isError} errorMessage="Couldn't load portfolio summary.">
        {summary.data ? (
          <View className="mb-6">
            <StatCardGrid minItemWidth={220}>
              <StatCard label="Portfolio value" value={formatMoney(summary.data.portfolioValue)} size="large" />
              <StatCard label="YTD net income" value={formatMoney(summary.data.ytdNetIncome)} size="large" />
              <StatCard label="Yield on cost" value={formatPercent(summary.data.blendedYieldOnCost)} size="large" />
              <StatCard label="Properties" value={String(summary.data.propertyCount)} size="large" />
            </StatCardGrid>

            <Pressable className="mt-3 self-start" onPress={() => setShowMoreMetrics((v) => !v)}>
              <Text className="text-xs font-semibold text-slate-500">
                {showMoreMetrics ? '▲ Show less' : '▼ Show more metrics'}
              </Text>
            </Pressable>

            {showMoreMetrics ? (
              <View className="mt-3">
                <StatCardGrid>
                  <StatCard label="YTD gross income" value={formatMoney(summary.data.ytdGrossIncome)} />
                  <StatCard label="YTD maintenance" value={formatMoney(summary.data.ytdMaintenanceSpend)} />
                  <StatCard label="Unpaid invoices" value={formatMoney(summary.data.unpaidInvoicesTotal)} />
                  <StatCard label="Overdue invoices" value={String(summary.data.overdueInvoicesCount)} />
                </StatCardGrid>
              </View>
            ) : null}
          </View>
        ) : null}
      </QueryState>

      <QueryState isLoading={income.isLoading} isError={income.isError} errorMessage="Couldn't load income by property.">
        <RankedSection title="Top properties by income" items={income.data ?? []} renderValue={(i) => formatMoney(i.value)} />
      </QueryState>

      <QueryState isLoading={returns.isLoading} isError={returns.isError} errorMessage="Couldn't load return by property.">
        <RankedSection title="Top properties by return" items={returns.data ?? []} renderValue={(i) => formatPercent(i.value)} />
      </QueryState>

      <QueryState
        isLoading={maintenance.isLoading}
        isError={maintenance.isError}
        errorMessage="Couldn't load maintenance by property."
      >
        <RankedSection title="Highest maintenance spend" items={maintenance.data ?? []} renderValue={(i) => formatMoney(i.value)} />
      </QueryState>
    </ScrollView>
  );
}
