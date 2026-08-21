import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import {
  useGetPortfolioSummaryQuery,
  useGetIncomeByPropertyQuery,
  useGetReturnByPropertyQuery,
  useGetMaintenanceByPropertyQuery,
  useGetPropertiesQuery,
  useGetInvoicesQuery,
  useGetFinancialYearReportQuery,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import StatCard from '../../components/StatCard';
import StatCardGrid from '../../components/StatCardGrid';
import RankedBarList from '../../components/RankedBarList';
import IncomeSpendingChart from '../../components/charts/IncomeSpendingChart';
import PersonalPropertySummaryFetcher from './PersonalPropertySummaryFetcher';
import type { PropertySummary } from '../../types/property';
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
import { daysUntilFinancialYearEnd, financialYearLabel, getRecentFinancialYears } from '../../utils/financialYear';

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

const RECENT_FINANCIAL_YEARS = getRecentFinancialYears(5);

export default function PortfolioScreen() {
  const [showMoreMetrics, setShowMoreMetrics] = useState(true);
  const [category, setCategory] = useState<CategoryFilterValue>('ALL');
  const [period, setPeriod] = useState<PeriodValue>('12M');
  const [personalSummaries, setPersonalSummaries] = useState<Record<string, PropertySummary>>({});
  const [fyParam, setFyParam] = useState<string>(RECENT_FINANCIAL_YEARS[0].param);

  const daysLeftInFy = daysUntilFinancialYearEnd();
  const showEofyBanner = daysLeftInFy <= 90;

  const fyReport = useGetFinancialYearReportQuery({ fy: fyParam });

  const handlePersonalSummaryLoaded = useCallback((propertyId: string, propertySummary: PropertySummary) => {
    setPersonalSummaries((prev) => (prev[propertyId] === propertySummary ? prev : { ...prev, [propertyId]: propertySummary }));
  }, []);

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

  const personalTotals = useMemo(
    () =>
      personalProperties.reduce(
        (acc, property) => {
          const propertySummary = personalSummaries[property.id];
          return {
            value: acc.value + (propertySummary?.lastValuation ?? property.purchasePrice),
            ytdSpend: acc.ytdSpend + (propertySummary?.ytdMaintenance ?? 0),
            unpaid: acc.unpaid + (propertySummary?.unpaidInvoicesTotal ?? 0),
          };
        },
        { value: 0, ytdSpend: 0, unpaid: 0 },
      ),
    [personalProperties, personalSummaries],
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
      {showEofyBanner ? (
        <View className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <Text className="text-sm font-semibold text-amber-900">
            {financialYearLabel(new Date())} ends in {daysLeftInFy} day{daysLeftInFy === 1 ? '' : 's'}
          </Text>
          <Text className="mt-1 text-xs text-amber-800">
            {summary.data && summary.data.overdueInvoicesCount > 0
              ? `${summary.data.overdueInvoicesCount} overdue invoice${summary.data.overdueInvoicesCount === 1 ? '' : 's'} still need sorting before EOFY.`
              : summary.data && summary.data.unpaidInvoicesTotal > 0
                ? `${formatMoney(summary.data.unpaidInvoicesTotal)} in unpaid invoices still to sort before EOFY.`
                : 'Good time to check everything is classified and up to date before EOFY.'}
          </Text>
        </View>
      ) : null}

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
          <Text className="mb-3 text-base font-semibold text-slate-900">Personal portfolio</Text>
          <QueryState isLoading={properties.isLoading} isError={properties.isError} errorMessage="Couldn't load personal properties.">
            {personalProperties.length === 0 ? (
              <Text className="text-sm text-slate-500">
                No personal properties yet — non-income properties you still spend money managing (a holiday home, the family
                place) can be added from the Personal tab.
              </Text>
            ) : (
              <>
                <StatCardGrid minItemWidth={220}>
                  <StatCard label="Personal property value" value={formatMoney(personalTotals.value)} size="large" />
                  <StatCard label="YTD spend" value={formatMoney(personalTotals.ytdSpend)} size="large" />
                  <StatCard label="Properties" value={String(personalProperties.length)} size="large" />
                </StatCardGrid>
                <Text className="mb-1 mt-2 text-xs text-slate-400">
                  Value uses each property's last valuation, or its purchase price where no valuation is on file.
                </Text>

                {personalTotals.unpaid > 0 ? (
                  <View className="mt-3">
                    <StatCardGrid>
                      <StatCard label="Unpaid invoices" value={formatMoney(personalTotals.unpaid)} />
                    </StatCardGrid>
                  </View>
                ) : null}

                {personalProperties.map((property) => (
                  <PersonalPropertySummaryFetcher
                    key={property.id}
                    propertyId={property.id}
                    onLoaded={handlePersonalSummaryLoaded}
                  />
                ))}
              </>
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

      <View className="mb-6">
        <Text className="mb-3 text-base font-semibold text-slate-900">Financial year report</Text>
        <FilterChips
          options={RECENT_FINANCIAL_YEARS.map((fy) => ({ value: fy.param, label: fy.label }))}
          value={fyParam}
          onChange={setFyParam}
        />
        <QueryState isLoading={fyReport.isLoading} isError={fyReport.isError} errorMessage="Couldn't load the financial year report.">
          {fyReport.data ? (
            <View className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {fyReport.data.properties.length === 0 ? (
                <Text className="p-4 text-center text-sm text-slate-500">No properties in this financial year.</Text>
              ) : (
                <>
                  {fyReport.data.properties.map((line, index) => (
                    <View key={line.propertyId} className={`px-4 py-3 ${index > 0 ? 'border-t border-slate-100' : ''}`}>
                      <View className="flex-row items-center justify-between">
                        <Text className="flex-1 pr-3 text-sm font-medium text-slate-800" numberOfLines={1}>
                          {line.propertyName}
                        </Text>
                        <Text className="text-sm font-semibold text-slate-900">{formatMoney(line.netIncome)}</Text>
                      </View>
                      <Text className="mt-0.5 text-xs text-slate-500">
                        Gross {formatMoney(line.grossIncome)} · Expenses {formatMoney(line.expensesTotal)}
                        {line.depreciationDiminishingValue ? ` · Depr. (DV) ${formatMoney(line.depreciationDiminishingValue)}` : ''}
                        {line.depreciationPrimeCost ? ` · Depr. (PC) ${formatMoney(line.depreciationPrimeCost)}` : ''}
                      </Text>
                    </View>
                  ))}
                  <View className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-semibold text-slate-900">Total</Text>
                      <Text className="text-sm font-bold text-slate-900">{formatMoney(fyReport.data.totals.netIncome)}</Text>
                    </View>
                    <Text className="mt-0.5 text-xs text-slate-500">
                      Gross {formatMoney(fyReport.data.totals.grossIncome)} · Expenses{' '}
                      {formatMoney(fyReport.data.totals.expensesTotal)}
                      {fyReport.data.totals.depreciationDiminishingValue
                        ? ` · Depr. (DV) ${formatMoney(fyReport.data.totals.depreciationDiminishingValue)}`
                        : ''}
                      {fyReport.data.totals.depreciationPrimeCost
                        ? ` · Depr. (PC) ${formatMoney(fyReport.data.totals.depreciationPrimeCost)}`
                        : ''}
                    </Text>
                  </View>
                </>
              )}
            </View>
          ) : null}
        </QueryState>
      </View>
    </ScrollView>
  );
}
