import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '../../store/hooks';
import { selectAuthUser } from '../../store/slices/auth-slice';
import { APPS } from '../../constants/apps';
import AppIcon from '../../components/AppIcon';
import GradientHero from '../../components/GradientHero';
import JarvisLogo from '../../components/JarvisLogo';
import { HOME_ROUTES, HomeStackParamList } from '../../navigation/routes';

type Props = NativeStackScreenProps<HomeStackParamList, typeof HOME_ROUTES.Dashboard>;

function greetingName(email: string | undefined) {
  if (!email) return 'there';
  const handle = email.split('@')[0];
  return handle.charAt(0).toUpperCase() + handle.slice(1);
}

export default function DashboardScreen({ navigation }: Props) {
  const user = useAppSelector(selectAuthUser);

  return (
    <ScrollView className="flex-1 bg-slate-100" contentContainerStyle={{ padding: 24, paddingTop: 48 }}>
      <View className="mb-6 flex-row items-center">
        <JarvisLogo size={44} />
        <Text className="ml-2 text-lg font-bold text-slate-900">Jarvis</Text>
      </View>

      <GradientHero fromColor="#4F46E5" toColor="#2a78d6">
        <Text className="text-3xl font-bold text-white">Hi, {greetingName(user?.email)}</Text>
        <Text className="mt-1 text-base text-white/80">Choose an app to get started.</Text>
      </GradientHero>

      <View className="mt-8 flex-row flex-wrap" style={{ gap: 28 }}>
        {APPS.map((app) => (
          <View key={app.id} style={{ width: 128 }} className="items-center">
            <AppIcon
              Icon={app.icon}
              color={app.color}
              size={88}
              onPress={() => navigation.navigate(app.route as any)}
            />
            <Text className="mt-2 text-center text-base font-semibold text-slate-800" numberOfLines={1}>
              {app.title}
            </Text>
            {!app.available ? (
              <Text className="mt-0.5 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
                Coming soon
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
