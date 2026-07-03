import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { onGet, onPost } from '../../api/client';
import { AUTH_TOKEN_KEY } from '../../utils/constants/storage-keys';
import { UserRole } from '../../utils/constants/user-role';
import type { RootState } from '../index';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  authInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  authInitialized: false,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (!token) return null;
  return onGet<AuthUser>('/auth/me');
});

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials) => {
  const { token, user } = await onPost<LoginResponse>('/auth/login', credentials);
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  return user;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionExpired: (state) => {
      state.user = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.authInitialized = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
        state.authInitialized = true;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      });
  },
});

export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthInitialized = (state: RootState) => state.auth.authInitialized;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null;
