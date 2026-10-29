import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { INVOICES_ROUTES, InvoicesStackParamList } from './routes';
import InvoicesSplitScreen from '../screens/Invoices/InvoicesSplitScreen';
import InvoiceFormScreen from '../screens/Invoices/InvoiceFormScreen';

const Stack = createNativeStackNavigator<InvoicesStackParamList>();

export default function InvoicesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name={INVOICES_ROUTES.InvoicesList} component={InvoicesSplitScreen} options={{ title: 'Invoices' }} />
      <Stack.Screen
        name={INVOICES_ROUTES.InvoiceForm}
        component={InvoiceFormScreen}
        options={{
          title: 'New invoice',
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
}
