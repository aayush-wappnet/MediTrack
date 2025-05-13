import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
import apiClient from '../api/apiClient';
import { login, register } from '../api/endpoints/auth';
import type { LoginDto, CreateUserDto } from '../api/types/auth.types';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, token, error } = useSelector(
    (state: RootState) => state.auth
  );

  const fetchProfile = async (): Promise<UserProfile> => {
    try {
      const response = await apiClient.get<UserProfile>('/users/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  };

  const handleLogin = async (data: LoginDto): Promise<boolean> => {
    try {
      const response = await login(data);
      localStorage.setItem('accessToken', response.accessToken);
      const profile = await fetchProfile();
      dispatch(loginSuccess({
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role,
        },
        token: response.accessToken,
      }));
      return true;
    } catch (error: any) {
      dispatch(
        loginFailure(error.response?.data?.message || 'Invalid credentials')
      );
      return false;
    }
  };

  const handleRegister = async (data: CreateUserDto) => {
    try {
      const response = await register(data);
      dispatch(
        loginSuccess({
          user: {
            id: response.user.id,
            email: response.user.email,
            role: response.user.role as 'doctor' | 'nurse' | 'patient',
          },
          token: '', // No token on register; user must login
        })
      );
      return response;
    } catch (error: any) {
      dispatch(
        loginFailure(error.response?.data?.message || 'Registration failed')
      );
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
  };

  return {
    isAuthenticated,
    user,
    token,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};