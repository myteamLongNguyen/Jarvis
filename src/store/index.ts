import { configureStore } from '@reduxjs/toolkit';
import authReducer, { sessionExpired } from './slices/auth-slice';
import { injectAuthHandlers } from '../api/client';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

injectAuthHandlers({
  dispatch: store.dispatch,
  onUnauthorized: sessionExpired,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
