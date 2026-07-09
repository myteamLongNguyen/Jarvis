import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { RootState } from '../index';

export interface AuthUser {
  id: string;
  email: string | undefined;
}

interface AuthCredentials {
  email: string;
  password: string;
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

function toAuthUser(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  return { id: session.user.id, email: session.user.email };
}

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return toAuthUser(data.session);
});

export const login = createAsyncThunk('auth/login', async (credentials: AuthCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) throw error;
  return toAuthUser(data.session);
});

export const signUp = createAsyncThunk('auth/signUp', async (credentials: AuthCredentials) => {
  const { data, error } = await supabase.auth.signUp(credentials);
  if (error) throw error;
  return toAuthUser(data.session);
});

export const logout = createAsyncThunk('auth/logout', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Keeps redux in sync with supabase-js's own onAuthStateChange stream
    // (token refreshes, sign-outs triggered elsewhere, etc).
    sessionChanged: (state, action: { payload: Session | null }) => {
      state.user = toAuthUser(action.payload);
      state.status = 'idle';
      state.authInitialized = true;
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
        state.error = action.error.message ?? 'Sign in failed';
      })
      .addCase(signUp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Sign up failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      });
  },
});

export const { sessionChanged } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthInitialized = (state: RootState) => state.auth.authInitialized;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null;
