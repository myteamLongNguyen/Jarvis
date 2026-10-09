import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useGenerateReviewScheduleMutation, useGetReviewScheduleQuery } from '../../api/jarvisApi';
import { formatDate, formatMoney } from '../../utils/format';

interface Props {
  leaseId: string;
  visible: boolean;
  onClose: () => void;
}

/**
 * Works out every review a lease implies (one on each anniversary, plus a market
 * review at the end of the term) and offers to create them in one go.
 *
 * It is a preview on purpose: the dates come from the lease, but the amounts for
 * a CPI or market review are not knowable in advance, so the user needs to see
 * what is about to be written before it is written.
 */
export default function ReviewScheduleSheet({ leaseId, visible, onClose }: Props) {
  const schedule = useGetReviewScheduleQuery(leaseId, { skip: !visible });
  const [generate, generateState] = useGenerateReviewScheduleMutation();

  const rows = schedule.data ?? [];
  const toCreate = rows.filter((r) => !r.alreadyRecorded);
  const existing = rows.length - toCreate.length;

  const handleConfirm = async () => {
    await generate(leaseId).unwrap().catch(() => undefined);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-4">
        <View style={{ width: '100%', maxWidth: 640, maxHeight: '85%' }} className="overflow-hidden rounded-3xl bg-white">
          <View className="flex-row items-center justify-between border-b border-slate-200 px-5 py-4">
            <Text className="text-lg font-semibold text-slate-900">Review schedule</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text className="text-lg text-slate-500">✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {schedule.isLoading ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#4f46e5" />
              </View>
            ) : rows.length === 0 ? (
              <Text className="text-base leading-6 text-slate-600">
                This lease doesn't have enough detail to work out a schedule. It needs a commencement date, an expiry
                date and a base rent.
              </Text>
            ) : (
              <>
                <Text className="mb-4 text-sm leading-5 text-slate-500">
                  Worked out from the lease: a review on each anniversary, then a market review at the end of the term.
                  Nothing is saved until you confirm.
                </Text>

                {rows.map((r) => (
                  <View
                    key={r.reviewDate}
                    className={`mb-2 rounded-2xl border p-3 ${
                      r.alreadyRecorded ? 'border-slate-200 bg-slate-50' : 'border-indigo-200 bg-white'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-slate-900">{formatDate(r.reviewDate)}</Text>
                      <Text className="text-sm text-slate-500">{r.reviewType.replace('_', ' ').toLowerCase()}</Text>
                    </View>

                    <Text className="mt-1 text-base text-slate-800">
                      {formatMoney(r.oldRentAnnual)}
                      {r.amountKnown ? ` → ${formatMoney(r.newRentAnnual)} (+${r.percentChange}%)` : ' → to be agreed'}
                    </Text>

                    {r.alreadyRecorded ? (
                      <Text className="mt-1 text-xs font-medium text-slate-500">Already recorded, will be left alone</Text>
                    ) : !r.amountKnown ? (
                      <Text className="mt-1 text-xs leading-4 text-amber-700">{r.notes}</Text>
                    ) : null}
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          {rows.length > 0 ? (
            <View className="border-t border-slate-200 px-5 py-4">
              {existing > 0 ? (
                <Text className="mb-2 text-xs text-slate-500">
                  {existing} of these {existing === 1 ? 'is' : 'are'} already on file and won't be touched.
                </Text>
              ) : null}
              <Pressable
                onPress={handleConfirm}
                disabled={toCreate.length === 0 || generateState.isLoading}
                className={`items-center rounded-xl py-3.5 ${
                  toCreate.length === 0 || generateState.isLoading ? 'bg-slate-300' : 'bg-indigo-600'
                }`}
              >
                {generateState.isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-base font-semibold text-white">
                    {toCreate.length === 0 ? 'Nothing new to add' : `Add ${toCreate.length} reviews`}
                  </Text>
                )}
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
