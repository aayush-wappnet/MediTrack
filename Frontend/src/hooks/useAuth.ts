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

interface ProfileResponse {
  id: string;
  firstName?: string;
}

interface CreateProfileDto {
  userId: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, token, profileId, error } = useSelector(
    (state: RootState) => state.auth
  );

  const fetchUserProfile = async (): Promise<UserProfile> => {
    try {
      const response = await apiClient.get<UserProfile>('/users/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  };

  const fetchRoleProfile = async (role: 'doctor' | 'nurse' | 'patient'): Promise<ProfileResponse> => {
    try {
      const endpoint = role === 'doctor' ? '/doctors/profile' : role === 'nurse' ? '/nurses/profile' : '/patients/profile';
      const response = await apiClient.get<ProfileResponse>(endpoint);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || `Failed to fetch ${role} profile`);
    }
  };

  const createRoleProfile = async (role: 'doctor' | 'nurse' | 'patient', data: CreateProfileDto) => {
    try {
      const endpoint = role === 'doctor' ? '/doctors' : role === 'nurse' ? '/nurses' : '/patients';
      const response = await apiClient.post<{ id: string }>(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || `Failed to create ${role} profile`);
    }
  };

  const handleLogin = async (data: LoginDto): Promise<boolean> => {
    try {
      const response = await login(data);
      localStorage.setItem('accessToken', response.accessToken);
      const userProfile = await fetchUserProfile();
      let profileData: ProfileResponse | null = null;
      if (userProfile.role !== 'admin') {
        profileData = await fetchRoleProfile(userProfile.role);
      }
      dispatch(loginSuccess({
        user: {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role,
        },
        token: response.accessToken,
        profileId: profileData?.id,
        firstName: profileData?.firstName,
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
      localStorage.setItem('accessToken', response.accessToken);
      dispatch(
        loginSuccess({
          user: {
            id: response.user.id,
            email: response.user.email,
            role: response.user.role as 'doctor' | 'nurse' | 'patient',
          },
          token: response.accessToken,
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

  const handleCompleteProfile = async (role: 'doctor' | 'nurse' | 'patient', data: CreateProfileDto) => {
    try {
      const profileResponse = await createRoleProfile(role, data);
      const profileData = await fetchRoleProfile(role);
      dispatch(
        loginSuccess({
          user: {
            id: data.userId,
            email: user?.email || '',
            role,
          },
          token: token || '',
          profileId: profileResponse.id,
          firstName: profileData.firstName,
        })
      );
      return profileResponse;
    } catch (error: any) {
      throw new Error(error.message || `Failed to complete ${role} profile`);
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
    profileId,
    error,
    login: handleLogin,
    register: handleRegister,
    completeProfile: handleCompleteProfile,
    logout: handleLogout,
  };
};