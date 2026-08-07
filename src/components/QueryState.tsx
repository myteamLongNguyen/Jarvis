import { View, Text, ActivityIndicator } from 'react-native';

interface Props {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  children: React.ReactNode;
}

export default function QueryState({ isLoading, isError, errorMessage, children }: Props) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-10">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-10">
        <Text className="text-center text-sm text-red-600">{errorMessage ?? 'Something went wrong.'}</Text>
      </View>
    );
  }

  return <>{children}</>;
}
