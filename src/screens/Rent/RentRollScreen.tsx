import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGetRentRollQuery } from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import StatCard from '../../components/StatCard';
import StatCardGrid from '../../components/StatCardGrid';
import { RENT_ROUTES, RentStackParamList } from '../../navigation/routes';
import type { RentRollRow, RentRollStatus } from '../../types/rental-income';
import { formatDate, formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RentStackParamList, typeof RENT_ROUTES.RentRoll>;

/**
 * How each status reads on the row. "Missing" is the one that matters most: it
 * means nothing has been recorded for that property this month, which is the
 * question the screen exists to answer.
 */
const STATUS_COPY: Record<RentRollStatus, { label: string; chip: string; dot: string }> = {
  RECEIVED: { label: 'Received', chip: 'bg-emerald-100 text-emerald-900', dot: 'bg-emerald-500' },
  INVOICED: { label: 'Invoiced', chip: 'bg-sky-100 text-sky-900', dot: 'bg-sky-500' },
  EXPECTED: { label: 'Expected', chip: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  OVERDUE: { label: 'Overdue', chip: 'bg-red-100 text-red-900', dot: 'bg-red-500' },
  WRITTEN_OFF: { label: 'Written off', chip: 'bg-amber-100 text-amber-900', dot: 'bg-amber-500' },
  MISSING: { label: 'Nothing recorded', chip: 'bg-violet-100 text-violet-900', dot: 'bg-violet-500' },
};

const MONTH_LABEL = (month: string) => {
  const [year, m] = month.split('-').map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

function shiftMonth(month: string, by: number): string {
  const [year, m] = month.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, m - 1 + by, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`;
}

function thisMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function RentRollScreen({ navigation }: Props) {
  const [month, setMonth] = useState(thisMonth);
  const rentRoll = useGetRentRollQuery({ month });

  const data = rentRoll.data;

  // Anything not yet settled floats to the top: that is the work list. Within
  // each group the order stays alphabetical, so a property does not jump around
  // between months.
  const rows = useMemo(() => {
    if (!data) return [];
    const rank: Record<RentRollStatus, number> = {
      MISSING: 0,
      OVERDUE: 1,
      EXPECTED: 2,
      INVOICED: 3,
      WRITTEN_OFF: 4,
      RECEIVED: 5,
    };
    return [...data.rows].sort((a, b) => rank[a.status] - rank[b.status] || a.propertyName.localeCompare(b.propertyName));
  }, [data]);

  const openRow = (row: RentRollRow) => {
    navigation.navigate(RENT_ROUTES.RentRollIncomeForm, {
      id: row.rentalIncomeId ?? undefined,
      propertyId: row.propertyId,
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={rentRoll.isFetching} onRefresh={() => rentRoll.refetch()} />}
    >
      <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-2 py-2">
        <Pressable onPress={() => setMonth((m) => shiftMonth(m, -1))} hitSlop={10} className="px-4 py-2">
          <Text className="text-xl text-slate-600">‹</Text>
        </Pressable>
        <View className="items-center">
          <Text className="text-lg font-bold text-slate-900">{MONTH_LABEL(month)}</Text>
          {month !== thisMonth() ? (
            <Pressable onPress={() => setMonth(thisMonth())} hitSlop={8}>
              <Text className="text-xs font-semibold text-indigo-600">Back to this month</Text>
            </Pressable>
          ) : (
            <Text className="text-xs font-medium text-slate-500">This month</Text>
          )}
        </View>
        <Pressable onPress={() => setMonth((m) => shiftMonth(m, 1))} hitSlop={10} className="px-4 py-2">
          <Text className="text-xl text-slate-600">›</Text>
        </Pressable>
      </View>

      <QueryState isLoading={rentRoll.isLoading} isError={rentRoll.isError} errorMessage="Couldn't load the rent roll.">
        {data ? (
          <>
            <StatCardGrid minItemWidth={170}>
              <StatCard label="Expected" value={formatMoney(data.totals.expected)} />
              <StatCard label="Received" value={formatMoney(data.totals.received)} />
              <StatCard label="Outstanding" value={formatMoney(data.totals.outstanding)} />
              <StatCard
                label="Properties paid"
                value={`${data.totals.propertiesReceived} of ${data.totals.propertiesTotal}`}
              />
            </StatCardGrid>

            {data.totals.propertiesMissing > 0 ? (
              <View className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
                <Text className="text-base font-semibold text-violet-900">
                  {data.totals.propertiesMissing}{' '}
                  {data.totals.propertiesMissing === 1 ? 'property has' : 'properties have'} nothing recorded
                </Text>
                <Text className="mt-1 text-sm leading-5 text-violet-800">
                  Either the rent has not been entered yet, or the agent statement for this month has not arrived. Tap
                  one to add it.
                </Text>
              </View>
            ) : null}

            <Text className="mb-2 mt-6 text-base font-semibold text-slate-900">By property</Text>

            {rows.length === 0 ? (
              <Text className="mt-3 text-center text-sm text-slate-500">No properties to show.</Text>
            ) : (
              <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {rows.map((row, index) => (
                  <RentRollRowView key={row.propertyId} row={row} first={index === 0} onPress={() => openRow(row)} />
                ))}
              </View>
            )}
          </>
        ) : null}
      </QueryState>
    </ScrollView>
  );
}

function RentRollRowView({ row, first, onPress }: { row: RentRollRow; first: boolean; onPress: () => void }) {
  const status = STATUS_COPY[row.status];
  const isMissing = row.status === 'MISSING';

  return (
    <Pressable onPress={onPress} className={`px-4 py-3 ${first ? '' : 'border-t border-slate-100'}`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-slate-900">{row.propertyName}</Text>
          <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
            <View className={`flex-row items-center rounded-full px-2 py-1 ${status.chip.split(' ')[0]}`}>
              <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status.dot}`} />
              <Text className={`text-xs font-semibold ${status.chip.split(' ')[1]}`}>{status.label}</Text>
            </View>
            {/* A filed statement on a month with nothing recorded is the most
                actionable thing on the screen, so it gets its own wording. */}
            {isMissing && row.hasDocument ? (
              <View className="rounded-full bg-amber-100 px-2 py-1">
                <Text className="text-xs font-semibold text-amber-900">Statement on file, not entered</Text>
              </View>
            ) : row.hasDocument ? (
              <View className="rounded-full bg-slate-100 px-2 py-1">
                <Text className="text-xs font-medium text-slate-600">
                  {row.invoiceNumber ? `Invoice ${row.invoiceNumber}` : 'Paperwork on file'}
                </Text>
              </View>
            ) : !isMissing ? (
              <View className="rounded-full bg-amber-50 px-2 py-1">
                <Text className="text-xs font-medium text-amber-800">No paperwork</Text>
              </View>
            ) : null}
            {row.recordCount > 1 ? (
              <View className="rounded-full bg-slate-100 px-2 py-1">
                <Text className="text-xs font-medium text-slate-600">{row.recordCount} records</Text>
              </View>
            ) : null}
            {/* The figure was split out of a quarterly or yearly statement, so
                it is an apportionment rather than something the agent filed. */}
            {row.apportioned ? (
              <View className="rounded-full bg-sky-50 px-2 py-1">
                <Text className="text-xs font-medium text-sky-800">Share of a longer statement</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="items-end">
          {isMissing ? (
            <>
              <Text className="text-base font-semibold text-slate-400">—</Text>
              {row.expectedFromLease ? (
                <Text className="mt-0.5 text-xs text-slate-500">
                  Lease says {formatMoney(row.expectedFromLease)}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Text className="text-base font-bold text-slate-900">{formatMoney(row.netAmount)}</Text>
              {row.outstanding > 0 ? (
                <Text className="mt-0.5 text-xs font-semibold text-red-600">
                  {formatMoney(row.outstanding)} outstanding
                </Text>
              ) : row.receivedDate ? (
                <Text className="mt-0.5 text-xs text-slate-500">Paid {formatDate(row.receivedDate)}</Text>
              ) : null}
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}
