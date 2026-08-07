import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MAIN_TAB_ROUTES, MainTabParamList } from './routes';
import PortfolioScreen from '../screens/Portfolio/PortfolioScreen';
import PropertiesNavigator from './PropertiesNavigator';
import InvoicesNavigator from './InvoicesNavigator';
import PersonalPropertiesNavigator from './PersonalPropertiesNavigator';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import Sidebar from './Sidebar';
import AiChatWidget from '../components/AiChatWidget';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabGlyph({ symbol }: { symbol: string }) {
  return <Text style={{ fontSize: 20 }}>{symbol}</Text>;
}

export default function MainNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <Sidebar {...props} />}
        screenOptions={{
          tabBarPosition: 'left',
        }}
      >
        <Tab.Screen
          name={MAIN_TAB_ROUTES.Portfolio}
          component={PortfolioScreen}
          options={{ tabBarIcon: () => <TabGlyph symbol="🏠" /> }}
        />
        <Tab.Screen
          name={MAIN_TAB_ROUTES.Properties}
          component={PropertiesNavigator}
          options={{ headerShown: false, tabBarIcon: () => <TabGlyph symbol="🏢" /> }}
        />
        <Tab.Screen
          name={MAIN_TAB_ROUTES.Invoices}
          component={InvoicesNavigator}
          options={{ headerShown: false, tabBarIcon: () => <TabGlyph symbol="🧾" /> }}
        />
        <Tab.Screen
          name={MAIN_TAB_ROUTES.Personal}
          component={PersonalPropertiesNavigator}
          options={{ headerShown: false, tabBarIcon: () => <TabGlyph symbol="🏡" /> }}
        />
        <Tab.Screen
          name={MAIN_TAB_ROUTES.Profile}
          component={ProfileScreen}
          options={{ tabBarIcon: () => <TabGlyph symbol="👤" /> }}
        />
      </Tab.Navigator>
      <AiChatWidget />
    </View>
  );
}
