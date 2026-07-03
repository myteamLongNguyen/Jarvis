import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MAIN_TAB_ROUTES, MainTabParamList } from './routes';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name={MAIN_TAB_ROUTES.Home} component={HomeScreen} />
      <Tab.Screen name={MAIN_TAB_ROUTES.Profile} component={ProfileScreen} />
    </Tab.Navigator>
  );
}
