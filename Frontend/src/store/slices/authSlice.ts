import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  firstName?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  profileId: string | null; // Stores patient.id, doctor.id, or nurse.id
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  profileId: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: User; token: string; profileId?: string; firstName?: string }>) {
      state.isAuthenticated = true;
      state.user = {
        ...action.payload.user,
        firstName: action.payload.firstName,
      };
      state.token = action.payload.token;
      state.profileId = action.payload.profileId || null;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.profileId = null;
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.profileId = null;
      state.error = null;
    },
  },
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;