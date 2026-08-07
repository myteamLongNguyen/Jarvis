import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PERSONAL_PROPERTIES_ROUTES, PersonalPropertiesStackParamList } from './routes';
import PersonalPropertiesSplitScreen from '../screens/PersonalProperties/PersonalPropertiesSplitScreen';
import PersonalPropertyDetailScreen from '../screens/PersonalProperties/PersonalPropertyDetailScreen';
import PersonalPropertyFormScreen from '../screens/PersonalProperties/PersonalPropertyFormScreen';

const Stack = createNativeStackNavigator<PersonalPropertiesStackParamList>();

export default function PersonalPropertiesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name={PERSONAL_PROPERTIES_ROUTES.PersonalPropertiesList}
        component={PersonalPropertiesSplitScreen}
        options={{ title: 'Personal properties' }}
      />
      <Stack.Screen
        name={PERSONAL_PROPERTIES_ROUTES.PersonalPropertyDetail}
        component={PersonalPropertyDetailScreen}
        options={{ title: 'Property' }}
      />
      <Stack.Screen
        name={PERSONAL_PROPERTIES_ROUTES.PersonalPropertyForm}
        component={PersonalPropertyFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Edit property' : 'New property',
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9],
          sheetGrabberVisible: true,
        })}
      />
    </Stack.Navigator>
  );
}
