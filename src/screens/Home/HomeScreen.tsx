import { View, Text, Pressable } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, selectAuthUser } from '../../store/slices/auth-slice';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-6 text-xl font-bold text-slate-900">Welcome{user?.email ? `, ${user.email}` : ''}</Text>
      <Pressable className="rounded-lg bg-slate-900 px-6 py-3" onPress={() => dispatch(logout())}>
        <Text className="font-semibold text-white">Log out</Text>
      </Pressable>
    </View>
  );
}
