import { View, Text, Pressable } from 'react-native';

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string | undefined) => void;
  allowClear?: boolean;
  error?: string;
}

export default function ChipPicker({ label, options, value, onChange, allowClear, error }: Props) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm font-medium text-slate-700">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {allowClear ? (
          <Pressable
            className={`rounded-full px-3 py-1.5 ${value === undefined ? 'bg-slate-900' : 'bg-slate-200'}`}
            onPress={() => onChange(undefined)}
          >
            <Text className={`text-xs font-medium ${value === undefined ? 'text-white' : 'text-slate-700'}`}>None</Text>
          </Pressable>
        ) : null}
        {options.map((option) => (
          <Pressable
            key={option.value}
            className={`rounded-full px-3 py-1.5 ${value === option.value ? 'bg-slate-900' : 'bg-slate-200'}`}
            onPress={() => onChange(option.value)}
          >
            <Text className={`text-xs font-medium ${value === option.value ? 'text-white' : 'text-slate-700'}`}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text className="mt-1 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
