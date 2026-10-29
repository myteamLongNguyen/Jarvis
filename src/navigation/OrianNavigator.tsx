import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useCompactLayout } from '../hooks/useCompactLayout';
import { ORIAN_ROUTES, OrianTabParamList } from './routes';
import OrianRail from './OrianRail';
import OrianDashboardScreen from '../screens/Orian/OrianDashboardScreen';
import OrianDocumentsScreen from '../screens/Orian/OrianDocumentsScreen';
import { ORIAN } from '../screens/Orian/theme';

const Tab = createBottomTabNavigator<OrianTabParamList>();

/**
 * Orian carries its own dark chrome rather than inheriting the light chrome
 * the rest of Jarvis uses, or every page would sit under a white bar.
 */
export default function OrianNavigator() {
  const isCompact = useCompactLayout();

  return (
    <Tab.Navigator
      tabBar={(props) => <OrianRail {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: ORIAN.bg },
        headerTintColor: ORIAN.accent,
        headerTitleStyle: { color: ORIAN.text },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: ORIAN.bg },
        // The rail sits down the side on a tablet and along the bottom on a
        // phone; the navigator has to agree with OrianRail on which it is.
        tabBarPosition: isCompact ? 'bottom' : 'left',
      }}
    >
      <Tab.Screen
        name={ORIAN_ROUTES.OrianDashboard}
        component={OrianDashboardScreen}
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Tab.Screen
        name={ORIAN_ROUTES.OrianDocuments}
        component={OrianDocumentsScreen}
        options={{ title: 'Documents', headerShown: false }}
      />
    </Tab.Navigator>
  );
}
