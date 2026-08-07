import { View, Text, TextInput, TextInputProps } from 'react-native';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  touched?: boolean;
}

export default function FormField({ label, error, touched, className, ...inputProps }: Props) {
  const showError = touched && error;
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm font-medium text-slate-700">{label}</Text>
      <TextInput
        className={`rounded-lg border px-4 py-3 text-base ${showError ? 'border-red-400' : 'border-slate-300'} ${className ?? ''}`}
        placeholderTextColor="#94a3b8"
        {...inputProps}
      />
      {showError ? <Text className="mt-1 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
