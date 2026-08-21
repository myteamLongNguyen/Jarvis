import { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGetTenantsQuery, useDeleteTenantMutation } from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.TenantsList>;

export default function TenantsListScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useGetTenantsQuery({ search: search || undefined, limit: 50 });
  const [deleteTenant] = useDeleteTenantMutation();

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete tenant?', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTenant(id) },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="border-b border-slate-200 bg-white px-4 pb-3 pt-3">
        <View className="mb-3 flex-row items-center justify-end">
          <Pressable
            className="rounded-lg bg-slate-900 px-3 py-2"
            onPress={() => navigation.navigate(PROPERTIES_ROUTES.TenantForm, {})}
          >
            <Text className="text-xs font-semibold text-white">+ New</Text>
          </Pressable>
        </View>
        <TextInput
          className="rounded-lg border border-slate-300 px-4 py-2 text-base"
          placeholder="Search by tenant name"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <QueryState isLoading={isLoading} isError={isError} errorMessage="Couldn't load tenants.">
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text className="text-center text-sm text-slate-500">No tenants yet.</Text>}
          renderItem={({ item }) => (
            <View className="mb-3 flex-row items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <Pressable
                className="flex-1 pr-3"
                onPress={() => navigation.navigate(PROPERTIES_ROUTES.TenantForm, { id: item.id })}
              >
                <Text className="text-base font-semibold text-slate-900">{item.name}</Text>
                <Text className="mt-0.5 text-xs text-slate-500">
                  {item.entityType}
                  {item.abn ? ` · ABN ${item.abn}` : ''}
                  {item.contactName ? ` · ${item.contactName}` : ''}
                </Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id, item.name)}>
                <Text className="text-xs font-semibold text-red-600">Delete</Text>
              </Pressable>
            </View>
          )}
        />
      </QueryState>
    </View>
  );
}
