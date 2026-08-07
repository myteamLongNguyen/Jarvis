import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer, { sessionChanged } from './slices/auth-slice';
import { injectAuthHandlers } from '../api/client';
import { jarvisApi } from '../api/jarvisApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [jarvisApi.reducerPath]: jarvisApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(jarvisApi.middleware),
});

setupListeners(store.dispatch);

injectAuthHandlers({
  dispatch: store.dispatch,
  onUnauthorized: () => sessionChanged(null),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
