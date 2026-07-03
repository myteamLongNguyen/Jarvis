import { View, Text, Pressable } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, selectAuthUser } from '../../store/slices/auth-slice';
import { canCreateJob } from '../../utils/permissions';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-xl font-bold text-slate-900">Welcome{user ? `, ${user.name}` : ''}</Text>
      <Text className="mb-6 text-slate-500">
        {canCreateJob(user) ? 'You can create jobs.' : 'You have read-only access.'}
      </Text>
      <Pressable className="rounded-lg bg-slate-900 px-6 py-3" onPress={() => dispatch(logout())}>
        <Text className="font-semibold text-white">Log out</Text>
      </Pressable>
    </View>
  );
}
