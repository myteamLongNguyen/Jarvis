import { View, Text } from 'react-native';

interface Item {
  id: string;
  label: string;
  value: number;
  displayValue: string;
}

interface Props {
  items: Item[];
}

const BAR_COLOR = '#2a78d6';
const MIN_WIDTH_PCT = 6;

export default function RankedBarList({ items }: Props) {
  const max = Math.max(...items.map((item) => Math.abs(item.value)), 1);

  return (
    <View className="gap-3">
      {items.map((item) => {
        const pct = Math.max(MIN_WIDTH_PCT, (Math.abs(item.value) / max) * 100);
        return (
          <View key={item.id}>
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="mr-2 flex-1 text-sm text-slate-700" numberOfLines={1}>
                {item.label}
              </Text>
              <Text className="text-sm font-semibold text-slate-900">{item.displayValue}</Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-slate-100">
              <View style={{ width: `${pct}%`, backgroundColor: BAR_COLOR }} className="h-2 rounded-full" />
            </View>
          </View>
        );
      })}
    </View>
  );
}
