import { View, Text } from 'react-native';

interface Props {
  label: string;
  value: string;
  className?: string;
  size?: 'default' | 'large';
}

export default function StatCard({ label, value, className, size = 'default' }: Props) {
  const isLarge = size === 'large';

  return (
    <View className={`rounded-xl border border-slate-200 bg-white ${isLarge ? 'p-5' : 'p-4'} ${className ?? ''}`}>
      <Text className={`mb-1 font-medium uppercase tracking-wide text-slate-500 ${isLarge ? 'text-xs' : 'text-xs'}`}>{label}</Text>
      <Text className={`font-bold text-slate-900 ${isLarge ? 'text-3xl' : 'text-lg'}`}>{value}</Text>
    </View>
  );
}
