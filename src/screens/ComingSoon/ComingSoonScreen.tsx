import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AppIcon from '../../components/AppIcon';
import { APPS } from '../../constants/apps';

export default function ComingSoonScreen() {
  const route = useRoute();
  const app = APPS.find((a) => a.route === route.name) ?? APPS[0];

  return (
    <View className="flex-1 items-center justify-center bg-slate-100 px-8">
      <AppIcon Icon={app.icon} color={app.color} size={120} />
      <Text className="mt-6 text-2xl font-bold text-slate-900">{app.title}</Text>
      <Text className="mt-2 text-center text-base text-slate-500">
        {app.title} isn't built yet — this app is coming soon to Jarvis.
      </Text>
    </View>
  );
}
