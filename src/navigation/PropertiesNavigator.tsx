import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PROPERTIES_ROUTES, PropertiesStackParamList } from './routes';
import PropertiesSplitScreen from '../screens/Properties/PropertiesSplitScreen';
import PropertyDetailScreen from '../screens/Properties/PropertyDetailScreen';
import PropertyFormScreen from '../screens/Properties/PropertyFormScreen';
import OwningEntitiesListScreen from '../screens/OwningEntities/OwningEntitiesListScreen';
import OwningEntityFormScreen from '../screens/OwningEntities/OwningEntityFormScreen';
import ManagingAgentsListScreen from '../screens/ManagingAgents/ManagingAgentsListScreen';
import ManagingAgentFormScreen from '../screens/ManagingAgents/ManagingAgentFormScreen';
import TenantsListScreen from '../screens/Tenants/TenantsListScreen';
import TenantFormScreen from '../screens/Tenants/TenantFormScreen';
import LeaseDetailScreen from '../screens/Leases/LeaseDetailScreen';
import LeaseFormScreen from '../screens/Leases/LeaseFormScreen';
import RentReviewFormScreen from '../screens/Leases/RentReviewFormScreen';
import RentalIncomeFormScreen from '../screens/RentalIncome/RentalIncomeFormScreen';
import DepreciationScheduleFormScreen from '../screens/DepreciationSchedules/DepreciationScheduleFormScreen';

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
          presentation: 'card',
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
      <Stack.Screen
        name={PROPERTIES_ROUTES.TenantsList}
        component={TenantsListScreen}
        options={{ title: 'Tenants', presentation: 'modal' }}
      />
      <Stack.Screen
        name={PROPERTIES_ROUTES.TenantForm}
        component={TenantFormScreen}
        options={({ route }) => ({ title: route.params?.id ? 'Edit tenant' : 'New tenant' })}
      />
      <Stack.Screen name={PROPERTIES_ROUTES.LeaseDetail} component={LeaseDetailScreen} options={{ title: 'Lease' }} />
      <Stack.Screen
        name={PROPERTIES_ROUTES.LeaseForm}
        component={LeaseFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Edit lease' : 'New lease',
          presentation: 'card',
        })}
      />
      <Stack.Screen
        name={PROPERTIES_ROUTES.RentReviewForm}
        component={RentReviewFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Edit rent review' : 'New rent review',
          presentation: 'card',
        })}
      />
      <Stack.Screen
        name={PROPERTIES_ROUTES.RentalIncomeForm}
        component={RentalIncomeFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Edit rental income' : 'Record rental income',
          presentation: 'card',
        })}
      />
      <Stack.Screen
        name={PROPERTIES_ROUTES.DepreciationScheduleForm}
        component={DepreciationScheduleFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Edit depreciation entry' : 'New depreciation entry',
          presentation: 'card',
        })}
      />
    </Stack.Navigator>
  );
}
