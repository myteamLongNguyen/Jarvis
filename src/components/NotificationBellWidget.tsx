import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCompactLayout } from '../hooks/useCompactLayout';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useGetRemindersQuery } from '../api/jarvisApi';
import { formatDate, formatMoney } from '../utils/format';
import { BellIcon } from './icons';
import type { ReminderCategory, ReminderItem } from '../types/reminder';

const CATEGORY_LABELS: Record<ReminderCategory, string> = {
  LEASE_EXPIRY: 'Lease expiries',
  RENT_REVIEW: 'Rent reviews',
  COMPLIANCE_RENEWAL: 'Insurance & compliance',
  UNPAID_RENTAL: 'Unpaid rental',
};

function BellRow({ item }: { item: ReminderItem }) {
  const overdue = item.severity === 'OVERDUE';
  return (
    <View className={`border-l-4 px-3 py-2 ${overdue ? 'border-red-500' : 'border-amber-400'}`}>
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 pr-2 text-sm font-medium text-slate-900" numberOfLines={1}>
          {item.title}
        </Text>
        {item.dueDate ? (
          <Text className={`text-[11px] font-semibold ${overdue ? 'text-red-600' : 'text-amber-700'}`}>
            {formatDate(item.dueDate)}
          </Text>
        ) : null}
      </View>
      <Text className="mt-0.5 text-xs text-slate-500" numberOfLines={2}>
        {item.detail}
        {item.amount ? ` · ${formatMoney(item.amount)}` : ''}
      </Text>
      {item.hiddenEarlierCount ? (
        <Text className="mt-0.5 text-[11px] font-semibold text-red-600">
          + {item.hiddenEarlierCount} earlier period{item.hiddenEarlierCount === 1 ? '' : 's'} also missing
        </Text>
      ) : null}
    </View>
  );
}

// Sits one button above the chat FAB, which itself clears the compact bottom bar.
const TAB_BAR_HEIGHT = 62;
const FAB_STACK_GAP = 72;

export default function NotificationBellWidget() {
  const insets = useSafeAreaInsets();
  const compact = useCompactLayout();
  const bottomOffset = compact ? TAB_BAR_HEIGHT + insets.bottom + 16 + FAB_STACK_GAP : 96;

  const [open, setOpen] = useState(false);
  const reminders = useGetRemindersQuery({ windowDays: 60 }, { pollingInterval: 5 * 60 * 1000 });

  const items = reminders.data?.items ?? [];
  const overdueCount = reminders.data?.counts.overdueTotal ?? 0;
  const badgeCount = items.length;

  if (!open) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        style={{ position: 'absolute', bottom: bottomOffset, right: 24, zIndex: 50 }}
        className="h-14 w-14 items-center justify-center rounded-full bg-amber-400 shadow-lg"
      >
        <BellIcon size={24} color="#1e293b" strokeWidth={1.8} />
        {badgeCount > 0 ? (
          <View
            className="absolute -right-1 -top-1 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1"
            style={{ height: 20 }}
          >
            <Text className="text-[11px] font-bold text-white">{badgeCount > 9 ? '9+' : badgeCount}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View
      style={{ position: 'absolute', bottom: 96, right: 24, width: 340, maxHeight: 480, zIndex: 50 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
    >
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-amber-400 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <BellIcon size={18} color="#1e293b" strokeWidth={1.8} />
          <Text className="text-base font-semibold text-slate-900">
            Reminders{overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}
          </Text>
        </View>
        <Pressable onPress={() => setOpen(false)} hitSlop={8}>
          <Text className="text-lg text-slate-900">✕</Text>
        </Pressable>
      </View>

      <ScrollView className="bg-slate-50" style={{ maxHeight: 430 }} contentContainerStyle={{ padding: 10 }}>
        {items.length === 0 ? (
          <Text className="p-4 text-center text-sm text-slate-500">
            {reminders.isLoading ? 'Loading…' : "You're all caught up."}
          </Text>
        ) : (
          (['LEASE_EXPIRY', 'RENT_REVIEW', 'COMPLIANCE_RENEWAL', 'UNPAID_RENTAL'] as ReminderCategory[]).map((category) => {
            const categoryItems = items.filter((i) => i.category === category);
            if (categoryItems.length === 0) return null;
            return (
              <View key={category} className="mb-3">
                <Text className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {CATEGORY_LABELS[category]}
                </Text>
                <View className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {categoryItems.map((item, index) => (
                    <View key={item.id} className={index > 0 ? 'border-t border-slate-100' : ''}>
                      <BellRow item={item} />
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
