import { View, Text } from 'react-native';
import { useGetPropertySummaryQuery } from '../../api/jarvisApi';
import type { Property } from '../../types/property';
import { formatMoney } from '../../utils/format';

interface Props {
  property: Property;
  isFirst?: boolean;
}

/** One personal property's spend, fetched independently so a slow property never blocks the rest of the list. */
export default function PersonalPropertySpendRow({ property, isFirst }: Props) {
  const summary = useGetPropertySummaryQuery(property.id);

  return (
    <View className={`flex-row items-center justify-between px-4 py-3 ${isFirst ? '' : 'border-t border-slate-100'}`}>
      <View className="flex-1 pr-3">
        <Text className="text-sm font-medium text-slate-800" numberOfLines={1}>
          {property.name}
        </Text>
        <Text className="mt-0.5 text-xs text-slate-500" numberOfLines={1}>
          {property.suburb}, {property.state}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-sm font-semibold text-slate-900">
          {summary.isLoading ? '…' : formatMoney(summary.data?.ytdMaintenance)}
        </Text>
        <Text className="mt-0.5 text-xs text-slate-500">YTD spend</Text>
        {summary.data && summary.data.unpaidInvoicesTotal > 0 ? (
          <Text className="mt-0.5 text-xs font-medium text-amber-600">{formatMoney(summary.data.unpaidInvoicesTotal)} unpaid</Text>
        ) : null}
      </View>
    </View>
  );
}
