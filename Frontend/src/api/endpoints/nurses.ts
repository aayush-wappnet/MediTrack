import apiClient from '../apiClient';
import type { Nurse } from '../types/nurses.types';

export const getNurses = async (): Promise<Nurse[]> => {
  const response = await apiClient.get<Nurse[]>('/nurses');
  return response.data;
};

export const getNurseProfile = async (): Promise<Nurse> => {
  const response = await apiClient.get<Nurse>(`/nurses/profile`);
  return response.data;
};

export const getNurseById = async (id: string): Promise<Nurse> => {
  const response = await apiClient.get<Nurse>(`/nurses/${id}`);
  return response.data;
};

export const updateNurseProfile = async (nurse: Nurse): Promise<Nurse> => {
  const response = await apiClient.patch<Nurse>(`/nurses/profile`, nurse);
  return response.data;
};

export const deleteNurse = async (id: string): Promise<void> => {
  await apiClient.delete(`/nurses/${id}`);
};
