import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AUTH_ROUTES, AuthStackParamList } from './routes';
import LoginScreen from '../screens/Login/LoginScreen';
import SignUpScreen from '../screens/SignUp/SignUpScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AUTH_ROUTES.Login} component={LoginScreen} />
      <Stack.Screen name={AUTH_ROUTES.SignUp} component={SignUpScreen} />
    </Stack.Navigator>
  );
}
