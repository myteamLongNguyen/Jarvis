import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MAIN_TAB_ROUTES, MainTabParamList } from './routes';
import PortfolioScreen from '../screens/Portfolio/PortfolioScreen';
import PropertiesNavigator from './PropertiesNavigator';
import InvoicesNavigator from './InvoicesNavigator';
import PersonalPropertiesNavigator from './PersonalPropertiesNavigator';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import Sidebar from './Sidebar';
import AiChatWidget from '../components/AiChatWidget';
import SmartScanScreen from '../screens/SmartScan/SmartScanScreen';
import NotificationBellWidget from '../components/NotificationBellWidget';
import { AppIconTile } from '../components/AppIcon';
import { BuildingIcon, ChartIcon, HomeIcon, ReceiptIcon, ScanIcon, UserIcon } from '../components/icons';
import type { IconProps } from '../components/icons';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Same flat-tile-with-motion-lines style as the app-picker icons on the Dashboard, sized down for
// the tab rail. Tile color rides the same focused/unfocused color Sidebar already computes for the label.
function TabTileIcon({ Icon, color }: { Icon: (props: IconProps) => React.ReactElement; color: string }) {
  return <AppIconTile Icon={Icon} color={color} size={34} />;
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
          options={{ tabBarIcon: ({ color }) => <TabTileIcon Icon={ChartIcon} color={color} /> }}
        />
        <Tab.Screen
          name={MAIN_TAB_ROUTES.SmartScan}
          component={SmartScanScreen}
          options={{ title: 'Smart Scan', tabBarIcon: ({ color }) => <TabTileIcon Icon={ScanIcon} color={color} /> }}
        />
        <Tab.Screen
          name={MAIN_TAB_ROUTES.Properties}
          component={PropertiesNavigator}
          options={{ headerShown: false, tabBarIcon: ({ color }) => <TabTileIcon Icon={BuildingIcon} color={color} /> }}
        />
        <Tab.Screen
          name={MAIN_TAB_ROUTES.Invoices}
          component={InvoicesNavigator}
          options={{ headerShown: false, tabBarIcon: ({ color }) => <TabTileIcon Icon={ReceiptIcon} color={color} /> }}
        />
        <Tab.Screen
          name={MAIN_TAB_ROUTES.Personal}
          component={PersonalPropertiesNavigator}
          options={{ headerShown: false, tabBarIcon: ({ color }) => <TabTileIcon Icon={HomeIcon} color={color} /> }}
        />
        <Tab.Screen
          name={MAIN_TAB_ROUTES.Profile}
          component={ProfileScreen}
          options={{ tabBarIcon: ({ color }) => <TabTileIcon Icon={UserIcon} color={color} /> }}
        />
      </Tab.Navigator>
      <NotificationBellWidget />
      <AiChatWidget />
    </View>
  );
}
