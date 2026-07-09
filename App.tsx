import './global.css';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import { useAppDispatch } from './src/store/hooks';
import { bootstrapAuth, sessionChanged } from './src/store/slices/auth-slice';
import { supabase } from './src/lib/supabase';
import RootNavigator from './src/navigation/RootNavigator';

function AppBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(sessionChanged(session));
    });

    return () => subscription.subscription.unsubscribe();
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
