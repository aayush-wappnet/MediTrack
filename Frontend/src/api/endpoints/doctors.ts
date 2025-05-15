import apiClient from '../apiClient';
import type { Doctor } from '../types/doctors.types';

export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await apiClient.get<Doctor[]>('/doctors');
  return response.data;
};