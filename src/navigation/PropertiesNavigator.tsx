import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from './routes';
import PropertiesSplitScreen from '../screens/Properties/PropertiesSplitScreen';
import PropertyDetailScreen from '../screens/Properties/PropertyDetailScreen';
import PropertyFormScreen from '../screens/Properties/PropertyFormScreen';
import OwningEntitiesListScreen from '../screens/OwningEntities/OwningEntitiesListScreen';
import OwningEntityFormScreen from '../screens/OwningEntities/OwningEntityFormScreen';
import ManagingAgentsListScreen from '../screens/ManagingAgents/ManagingAgentsListScreen';
import ManagingAgentFormScreen from '../screens/ManagingAgents/ManagingAgentFormScreen';

const Stack = createNativeStackNavigator<PropertiesStackParamList>();

export default function PropertiesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name={PROPERTIES_ROUTES.PropertiesList} component={PropertiesSplitScreen} options={{ title: 'Properties' }} />
      <Stack.Screen name={PROPERTIES_ROUTES.PropertyDetail} component={PropertyDetailScreen} options={{ title: 'Property' }} />
      <Stack.Screen
        name={PROPERTIES_ROUTES.PropertyForm}
        component={PropertyFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Edit property' : 'New property',
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9],
          sheetGrabberVisible: true,
        })}
      />
      <Stack.Screen
        name={PROPERTIES_ROUTES.OwningEntitiesList}
        component={OwningEntitiesListScreen}
        options={{ title: 'Owning entities', presentation: 'modal' }}
      />
      <Stack.Screen
        name={PROPERTIES_ROUTES.OwningEntityForm}
        component={OwningEntityFormScreen}
        options={({ route }) => ({ title: route.params?.id ? 'Edit entity' : 'New entity' })}
      />
      <Stack.Screen
        name={PROPERTIES_ROUTES.ManagingAgentsList}
        component={ManagingAgentsListScreen}
        options={{ title: 'Managing agents', presentation: 'modal' }}
      />
      <Stack.Screen
        name={PROPERTIES_ROUTES.ManagingAgentForm}
        component={ManagingAgentFormScreen}
        options={({ route }) => ({ title: route.params?.id ? 'Edit agent' : 'New agent' })}
      />
    </Stack.Navigator>
  );
}
