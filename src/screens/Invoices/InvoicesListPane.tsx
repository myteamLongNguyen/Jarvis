import { useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useGetInvoicesQuery, useGetPropertiesQuery } from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import { formatMoney } from '../../utils/format';
import { INVOICE_STATUSES, InvoiceStatus } from '../../types/invoice';

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<InvoiceStatus, { bg: string; text: string }> = {
  UNSORTED: { bg: 'bg-amber-100', text: 'text-amber-700' },
  CLASSIFIED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  APPROVED: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  PAID: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  OVERDUE: { bg: 'bg-red-100', text: 'text-red-700' },
  DISPUTED: { bg: 'bg-orange-100', text: 'text-orange-700' },
  WRITTEN_OFF: { bg: 'bg-slate-200', text: 'text-slate-500' },
};

function monthBounds(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const from = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  const to = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
  return { from, to };
}

interface Props {
  selectedId?: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export default function InvoicesListPane({ selectedId, onSelect, onCreate }: Props) {
  const [month, setMonth] = useState(() => new Date());
  const [status, setStatus] = useState<InvoiceStatus | undefined>(undefined);
  const [offset, setOffset] = useState(0);

  const { from, to } = useMemo(() => monthBounds(month), [month]);

  const { data, isLoading, isError, isFetching } = useGetInvoicesQuery({
    from,
    to,
    status,
    offset,
    limit: PAGE_SIZE,
  });

  const properties = useGetPropertiesQuery({ limit: 200 });
  const propertyNameById = useMemo(() => {
    const map = new Map<string, string>();
    (properties.data?.items ?? []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [properties.data]);

  const monthLabel = month.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

  const changeMonth = (delta: number) => {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
    setOffset(0);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="border-b border-slate-200 bg-white px-4 pb-3 pt-3">
        <View className="mb-3 flex-row items-center justify-between">
          <Pressable onPress={() => changeMonth(-1)} hitSlop={8}>
            <Text className="text-lg text-slate-500">‹</Text>
          </Pressable>
          <Text className="text-sm font-semibold text-slate-900">{monthLabel}</Text>
          <Pressable onPress={() => changeMonth(1)} hitSlop={8}>
            <Text className="text-lg text-slate-500">›</Text>
          </Pressable>
        </View>

        <Pressable className="mb-3 items-center rounded-lg bg-slate-900 py-2" onPress={onCreate}>
          <Text className="text-xs font-semibold text-white">+ New invoice</Text>
        </Pressable>

        <View className="flex-row flex-wrap gap-2">
          <Pressable
            className={`rounded-full px-3 py-1 ${status === undefined ? 'bg-slate-900' : 'bg-slate-200'}`}
            onPress={() => {
              setStatus(undefined);
              setOffset(0);
            }}
          >
            <Text className={`text-xs font-medium ${status === undefined ? 'text-white' : 'text-slate-700'}`}>All</Text>
          </Pressable>
          {INVOICE_STATUSES.map((s) => (
            <Pressable
              key={s}
              className={`rounded-full px-3 py-1 ${status === s ? 'bg-slate-900' : 'bg-slate-200'}`}
              onPress={() => {
                setStatus(s);
                setOffset(0);
              }}
            >
              <Text className={`text-xs font-medium ${status === s ? 'text-white' : 'text-slate-700'}`}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <QueryState isLoading={isLoading} isError={isError} errorMessage="Couldn't load invoices.">
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text className="text-center text-sm text-slate-500">No invoices for this period.</Text>}
          renderItem={({ item }) => (
            <Pressable
              className={`mb-3 rounded-xl border p-4 ${
                item.id === selectedId ? 'border-slate-900 bg-slate-100' : 'border-slate-200 bg-white'
              }`}
              onPress={() => onSelect(item.id)}
            >
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-base font-semibold text-slate-900" numberOfLines={1}>
                  {item.issuerName}
                </Text>
                <Text className="text-sm font-semibold text-slate-900">{formatMoney(item.totalAmount, item.currency)}</Text>
              </View>
              <Text className="mt-0.5 text-xs text-slate-500">
                {item.invoiceType} · {item.propertyId ? (propertyNameById.get(item.propertyId) ?? 'Unknown property') : 'Unassigned'}
              </Text>
              <View className={`mt-2 self-start rounded-full px-2 py-0.5 ${STATUS_BADGE[item.status].bg}`}>
                <Text className={`text-[10px] font-semibold uppercase ${STATUS_BADGE[item.status].text}`}>{item.status}</Text>
              </View>
            </Pressable>
          )}
        />
      </QueryState>

      {data ? (
        <View className="flex-row items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
          <Pressable
            disabled={offset === 0}
            onPress={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            className={offset === 0 ? 'opacity-30' : ''}
          >
            <Text className="text-sm font-semibold text-slate-900">Previous</Text>
          </Pressable>
          <Text className="text-xs text-slate-500">
            {data.total === 0 ? '0' : `${offset + 1}-${Math.min(offset + PAGE_SIZE, data.total)}`} of {data.total}
            {isFetching ? '…' : ''}
          </Text>
          <Pressable
            disabled={offset + PAGE_SIZE >= data.total}
            onPress={() => setOffset(offset + PAGE_SIZE)}
            className={offset + PAGE_SIZE >= data.total ? 'opacity-30' : ''}
          >
            <Text className="text-sm font-semibold text-slate-900">Next</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
