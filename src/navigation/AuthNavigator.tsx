import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AUTH_ROUTES, AuthStackParamList } from './routes';
import LoginScreen from '../screens/Login/LoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AUTH_ROUTES.Login} component={LoginScreen} />
    </Stack.Navigator>
  );
}
