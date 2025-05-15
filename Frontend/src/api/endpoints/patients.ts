import apiClient from '../apiClient';
import type { Patient } from '../types/patients.types';

export const getPatients = async (): Promise<Patient[]> => {
  const response = await apiClient.get<Patient[]>('/patients');
  return response.data;
};

export const getPatientById = async (id: string): Promise<Patient> => {
  const response = await apiClient.get<Patient>(`/patients/${id}`);
  return response.data;
};