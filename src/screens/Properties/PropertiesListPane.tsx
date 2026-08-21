import { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { useGetPropertiesQuery } from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import { PROPERTY_STATUSES, PropertyCategory, PropertyStatus } from '../../types/property';

const PAGE_SIZE = 20;

interface Props {
  category?: PropertyCategory;
  selectedId?: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onOpenEntities?: () => void;
  onOpenAgents?: () => void;
  onOpenTenants?: () => void;
}

export default function PropertiesListPane({
  category = 'INVESTMENT',
  selectedId,
  onSelect,
  onCreate,
  onOpenEntities,
  onOpenAgents,
  onOpenTenants,
}: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PropertyStatus | undefined>(undefined);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, isFetching } = useGetPropertiesQuery({
    search: search || undefined,
    status,
    category,
    offset,
    limit: PAGE_SIZE,
  });

  return (
    <View className="flex-1 bg-slate-50">
      <View className="border-b border-slate-200 bg-white px-4 pb-3 pt-3">
        <View className="mb-3 flex-row items-center justify-end gap-2">
          {onOpenEntities ? (
            <Pressable className="rounded-lg border border-slate-300 px-3 py-2" onPress={onOpenEntities}>
              <Text className="text-xs font-semibold text-slate-700">Entities</Text>
            </Pressable>
          ) : null}
          {onOpenAgents ? (
            <Pressable className="rounded-lg border border-slate-300 px-3 py-2" onPress={onOpenAgents}>
              <Text className="text-xs font-semibold text-slate-700">Agents</Text>
            </Pressable>
          ) : null}
          {onOpenTenants ? (
            <Pressable className="rounded-lg border border-slate-300 px-3 py-2" onPress={onOpenTenants}>
              <Text className="text-xs font-semibold text-slate-700">Tenants</Text>
            </Pressable>
          ) : null}
          <Pressable className="rounded-lg bg-slate-900 px-3 py-2" onPress={onCreate}>
            <Text className="text-xs font-semibold text-white">+ New</Text>
          </Pressable>
        </View>

        <TextInput
          className="mb-3 rounded-lg border border-slate-300 px-4 py-2 text-base"
          placeholder="Search by name or address"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setOffset(0);
          }}
        />

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
          {PROPERTY_STATUSES.map((s) => (
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

      <QueryState isLoading={isLoading} isError={isError} errorMessage="Couldn't load properties.">
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text className="text-center text-sm text-slate-500">No properties found.</Text>}
          renderItem={({ item }) => (
            <Pressable
              className={`mb-3 rounded-xl border p-4 ${
                item.id === selectedId ? 'border-slate-900 bg-slate-100' : 'border-slate-200 bg-white'
              }`}
              onPress={() => onSelect(item.id)}
            >
              <Text className="text-base font-semibold text-slate-900">{item.name}</Text>
              <Text className="mt-0.5 text-sm text-slate-500">
                {item.addressLine1}, {item.suburb} {item.state} {item.postcode}
              </Text>
              <Text className="mt-2 text-xs font-medium text-slate-500">
                {item.propertyType} · {item.status}
              </Text>
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
