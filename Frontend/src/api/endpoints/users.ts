import apiClient from '../apiClient';
import type { User, UpdateUserDto } from '../types/users.types';

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
  const response = await apiClient.patch<User>(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/users/${id}`);
  return response.data;
};