import './global.css';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import { useAppDispatch } from './src/store/hooks';
import { bootstrapAuth } from './src/store/slices/auth-slice';
import RootNavigator from './src/navigation/RootNavigator';

function AppBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return <RootNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppBootstrap />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </Provider>
  );
}
