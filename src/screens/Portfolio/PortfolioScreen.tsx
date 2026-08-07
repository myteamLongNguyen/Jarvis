import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import {
  useGetPortfolioSummaryQuery,
  useGetIncomeByPropertyQuery,
  useGetReturnByPropertyQuery,
  useGetMaintenanceByPropertyQuery,
  useGetPropertiesQuery,
  useGetInvoicesQuery,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import StatCard from '../../components/StatCard';
import StatCardGrid from '../../components/StatCardGrid';
import RankedBarList from '../../components/RankedBarList';
import IncomeSpendingChart from '../../components/charts/IncomeSpendingChart';
import PersonalPropertySpendRow from './PersonalPropertySpendRow';
import { formatMoney, formatPercent } from '../../utils/format';
import {
  CATEGORY_FILTERS,
  CategoryFilterValue,
  PERIOD_OPTIONS,
  PeriodValue,
  buildCategoryMap,
  buildMonthlySeries,
  filterRankedByCategory,
  getPeriodRange,
} from '../../utils/portfolioAnalytics';

function RankedSection<T extends { propertyId: string; propertyName: string; value: number }>({
  title,
  items,
  renderValue,
  emptyMessage,
}: {
  title: string;
  items: T[];
  renderValue: (item: T) => string;
  emptyMessage?: string;
}) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-slate-900">{title}</Text>
      {items.length === 0 ? (
        <Text className="text-sm text-slate-500">{emptyMessage ?? 'No data yet.'}</Text>
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

function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <Pressable
          key={option.value}
          className={`rounded-full px-3 py-1.5 ${value === option.value ? 'bg-slate-900' : 'bg-slate-200'}`}
          onPress={() => onChange(option.value)}
        >
          <Text className={`text-xs font-medium ${value === option.value ? 'text-white' : 'text-slate-700'}`}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function PortfolioScreen() {
  const [showMoreMetrics, setShowMoreMetrics] = useState(false);
  const [category, setCategory] = useState<CategoryFilterValue>('ALL');
  const [period, setPeriod] = useState<PeriodValue>('12M');

  const summary = useGetPortfolioSummaryQuery();
  const income = useGetIncomeByPropertyQuery();
  const returns = useGetReturnByPropertyQuery();
  const maintenance = useGetMaintenanceByPropertyQuery();
  const properties = useGetPropertiesQuery({ limit: 500 });

  const range = useMemo(() => getPeriodRange(period), [period]);
  const invoices = useGetInvoicesQuery({ from: range.from, to: range.to, limit: 500 });

  const categoryMap = useMemo(() => buildCategoryMap(properties.data?.items ?? []), [properties.data]);
  const personalProperties = useMemo(
    () => (properties.data?.items ?? []).filter((p) => p.category === 'PERSONAL'),
    [properties.data],
  );

  const monthlySeries = useMemo(
    () => buildMonthlySeries(invoices.data?.items ?? [], categoryMap, range.from, range.to, category),
    [invoices.data, categoryMap, range, category],
  );

  const filteredIncome = useMemo(() => filterRankedByCategory(income.data ?? [], categoryMap, category), [income.data, categoryMap, category]);
  const filteredReturns = useMemo(() => filterRankedByCategory(returns.data ?? [], categoryMap, category), [returns.data, categoryMap, category]);
  const filteredMaintenance = useMemo(
    () => filterRankedByCategory(maintenance.data ?? [], categoryMap, category),
    [maintenance.data, categoryMap, category],
  );

  const periodLabel = period === 'YTD' ? 'Year to date' : `Last ${PERIOD_OPTIONS.find((p) => p.value === period)?.label}`;
  const showInvestmentStats = category !== 'PERSONAL';
  const showPersonalSection = category !== 'INVESTMENT';
  const showIncomeAndReturn = category !== 'PERSONAL';

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16 }}>
      <View className="mb-5">
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Properties</Text>
        <FilterChips options={CATEGORY_FILTERS} value={category} onChange={setCategory} />
        <Text className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Period</Text>
        <FilterChips options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      </View>

      {showInvestmentStats ? (
        <QueryState isLoading={summary.isLoading} isError={summary.isError} errorMessage="Couldn't load portfolio summary.">
          {summary.data ? (
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-slate-900">Investment portfolio</Text>
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
      ) : null}

      {showPersonalSection ? (
        <View className="mb-6">
          <Text className="mb-3 text-base font-semibold text-slate-900">Personal properties</Text>
          <QueryState isLoading={properties.isLoading} isError={properties.isError} errorMessage="Couldn't load personal properties.">
            {personalProperties.length === 0 ? (
              <Text className="text-sm text-slate-500">
                No personal properties yet — non-income properties you still spend money managing (a holiday home, the family
                place) can be added from the Personal tab.
              </Text>
            ) : (
              <View className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {personalProperties.map((property, index) => (
                  <PersonalPropertySpendRow key={property.id} property={property} isFirst={index === 0} />
                ))}
              </View>
            )}
          </QueryState>
        </View>
      ) : null}

      <QueryState isLoading={invoices.isLoading} isError={invoices.isError} errorMessage="Couldn't load income and spending.">
        <View className="mb-6">
          <IncomeSpendingChart data={monthlySeries} periodLabel={periodLabel} />
        </View>
      </QueryState>

      {showIncomeAndReturn ? (
        <QueryState isLoading={income.isLoading} isError={income.isError} errorMessage="Couldn't load income by property.">
          <RankedSection
            title="Top properties by income"
            items={filteredIncome}
            renderValue={(i) => formatMoney(i.value)}
            emptyMessage={category === 'ALL' ? 'No data yet.' : 'No properties match this filter.'}
          />
        </QueryState>
      ) : null}

      {showIncomeAndReturn ? (
        <QueryState isLoading={returns.isLoading} isError={returns.isError} errorMessage="Couldn't load return by property.">
          <RankedSection
            title="Top properties by return"
            items={filteredReturns}
            renderValue={(i) => formatPercent(i.value)}
            emptyMessage={category === 'ALL' ? 'No data yet.' : 'No properties match this filter.'}
          />
        </QueryState>
      ) : null}

      <QueryState
        isLoading={maintenance.isLoading}
        isError={maintenance.isError}
        errorMessage="Couldn't load maintenance by property."
      >
        <RankedSection
          title="Highest maintenance spend"
          items={filteredMaintenance}
          renderValue={(i) => formatMoney(i.value)}
          emptyMessage={category === 'ALL' ? 'No data yet.' : 'No properties match this filter.'}
        />
      </QueryState>
    </ScrollView>
  );
}
