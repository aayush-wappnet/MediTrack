import apiClient from '../apiClient';
import type { Nurse } from '../types/nurses.types';

export const getNurses = async (): Promise<Nurse[]> => {
  const response = await apiClient.get<Nurse[]>('/nurses');
  return response.data;
};