import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RENT_ROUTES, RentStackParamList } from './routes';
import RentRollScreen from '../screens/Rent/RentRollScreen';
import RentalIncomeFormScreen from '../screens/RentalIncome/RentalIncomeFormScreen';

const Stack = createNativeStackNavigator<RentStackParamList>();

export default function RentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name={RENT_ROUTES.RentRoll} component={RentRollScreen} options={{ title: 'Rent' }} />
      <Stack.Screen
        name={RENT_ROUTES.RentRollIncomeForm}
        component={RentalIncomeFormScreen as never}
        options={{ title: 'Rent received', presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}
