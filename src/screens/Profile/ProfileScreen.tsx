import { View, Text } from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { selectAuthUser } from '../../store/slices/auth-slice';

export default function ProfileScreen() {
  const user = useAppSelector(selectAuthUser);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-1 text-lg font-semibold text-slate-900">{user?.email}</Text>
      <Text className="text-slate-400">{user?.id}</Text>
    </View>
  );
}
