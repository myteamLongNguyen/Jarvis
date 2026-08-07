import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HOME_ROUTES, HomeStackParamList } from './routes';
import { APPS } from '../constants/apps';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ComingSoonScreen from '../screens/ComingSoon/ComingSoonScreen';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={HOME_ROUTES.Dashboard} component={DashboardScreen} />
      <Stack.Screen name={HOME_ROUTES.PropertiesApp} component={MainNavigator} />
      {APPS.filter((app) => !app.available).map((app) => (
        <Stack.Screen
          key={app.route}
          name={app.route as Exclude<keyof HomeStackParamList, 'Dashboard' | 'PropertiesApp'>}
          component={ComingSoonScreen}
          options={{ headerShown: true, title: app.title }}
        />
      ))}
    </Stack.Navigator>
  );
}
