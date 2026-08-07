import { View, Text, Pressable } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, selectAuthUser } from '../../store/slices/auth-slice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-1 text-lg font-semibold text-slate-900">{user?.email}</Text>
      <Text className="mb-6 text-slate-400">{user?.id}</Text>
      <Pressable className="rounded-lg bg-slate-900 px-6 py-3" onPress={() => dispatch(logout())}>
        <Text className="font-semibold text-white">Log out</Text>
      </Pressable>
    </View>
  );
}
