import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useGetLeaseQuery,
  useGetTenantQuery,
  useGetRentReviewsQuery,
  useDeleteLeaseMutation,
  useDeleteRentReviewMutation,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import StatCard from '../../components/StatCard';
import StatCardGrid from '../../components/StatCardGrid';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from '../../navigation/routes';
import { formatDate, formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<PropertiesStackParamList, typeof PROPERTIES_ROUTES.LeaseDetail>;

export default function LeaseDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;

  const lease = useGetLeaseQuery(id);
  const tenant = useGetTenantQuery(lease.data?.tenantId as string, { skip: !lease.data });
  const rentReviews = useGetRentReviewsQuery({ leaseId: id, limit: 50 }, { skip: !lease.data });
  const [deleteLease, deleteState] = useDeleteLeaseMutation();
  const [deleteRentReview] = useDeleteRentReviewMutation();

  const handleDelete = () => {
    if (!lease.data) return;
    const propertyId = lease.data.propertyId;
    Alert.alert('Delete lease?', 'This can be restored later if needed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLease({ id, propertyId });
          navigation.goBack();
        },
      },
    ]);
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert('Delete rent review?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRentReview({ id: reviewId, leaseId: id }) },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16 }}>
      <QueryState isLoading={lease.isLoading} isError={lease.isError} errorMessage="Couldn't load this lease.">
        {lease.data ? (
          <>
            <View className="mb-4 flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-2xl font-bold text-slate-900">{tenant.data?.name ?? 'Lease'}</Text>
                <Text className="mt-1 text-xs font-medium text-slate-500">
                  {lease.data.status} · {formatDate(lease.data.commencementDate)} → {formatDate(lease.data.expiryDate)}
                </Text>
              </View>
              <View className="gap-2">
                <Pressable
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  onPress={() => navigation.navigate(PROPERTIES_ROUTES.LeaseForm, { id, propertyId: lease.data!.propertyId })}
                >
                  <Text className="text-xs font-semibold text-slate-700">Edit</Text>
                </Pressable>
                <Pressable className="rounded-lg border border-red-300 px-3 py-2" onPress={handleDelete} disabled={deleteState.isLoading}>
                  <Text className="text-xs font-semibold text-red-600">Delete</Text>
                </Pressable>
              </View>
            </View>

            <StatCardGrid minItemWidth={170}>
              <StatCard label="Annual rent" value={formatMoney(lease.data.baseRentAnnual)} />
              <StatCard label="Frequency" value={lease.data.rentFrequency} />
              <StatCard label="Outgoings" value={lease.data.outgoingsRecoveryType} />
              <StatCard label="Term" value={`${lease.data.initialTermMonths} mo`} />
              <StatCard label="Review mechanism" value={lease.data.rentReviewMechanism} />
              <StatCard label="Next review" value={formatDate(lease.data.nextReviewDate)} />
              <StatCard label="Bond" value={formatMoney(lease.data.bondAmount)} />
              <StatCard label="Bond type" value={lease.data.bondType} />
            </StatCardGrid>

            {lease.data.notes ? <Text className="mt-4 text-sm text-slate-600">{lease.data.notes}</Text> : null}

            <View className="mt-6 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-slate-900">Rent reviews</Text>
              <Pressable
                className="rounded-lg bg-slate-900 px-3 py-2"
                onPress={() => navigation.navigate(PROPERTIES_ROUTES.RentReviewForm, { leaseId: id })}
              >
                <Text className="text-xs font-semibold text-white">+ Add review</Text>
              </Pressable>
            </View>

            <QueryState isLoading={rentReviews.isLoading} isError={rentReviews.isError} errorMessage="Couldn't load rent reviews.">
              {rentReviews.data && rentReviews.data.items.length > 0 ? (
                <View className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {rentReviews.data.items.map((r, index) => (
                    <Pressable
                      key={r.id}
                      className={`px-4 py-3 ${index > 0 ? 'border-t border-slate-100' : ''}`}
                      onPress={() => navigation.navigate(PROPERTIES_ROUTES.RentReviewForm, { id: r.id, leaseId: id })}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-slate-800">{formatDate(r.reviewDate)}</Text>
                        <Text className="text-sm font-semibold text-slate-900">
                          {formatMoney(r.oldRentAnnual)} → {formatMoney(r.newRentAnnual)} ({r.percentChange >= 0 ? '+' : ''}
                          {r.percentChange.toFixed(2)}%)
                        </Text>
                      </View>
                      <View className="mt-0.5 flex-row items-center justify-between">
                        <Text className="text-xs text-slate-500">
                          {r.reviewType} · {r.status}
                        </Text>
                        <Pressable onPress={() => handleDeleteReview(r.id)}>
                          <Text className="text-xs font-semibold text-red-600">Delete</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text className="mt-3 text-center text-sm text-slate-500">No rent reviews recorded yet.</Text>
              )}
            </QueryState>
          </>
        ) : null}
      </QueryState>
    </ScrollView>
  );
}
