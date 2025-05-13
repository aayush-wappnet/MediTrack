import apiClient from '../apiClient';
import type { LoginDto, CreateUserDto, LoginResponse, RegisterResponse } from '../types/auth.types';

export const login = async (data: LoginDto): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const register = async (data: CreateUserDto): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data);
  return response.data;
};