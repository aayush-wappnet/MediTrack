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

export const getPatientProfile = async (): Promise<Patient> => {
  const response = await apiClient.get<Patient>(`/patients/profile`);
  return response.data;
};

export const updatePatientProfile = async (patient: Patient): Promise<Patient> => {
  const response = await apiClient.patch<Patient>(`/patients/profile`, patient);
  return response.data;
};

export const deletePatient = async (id: string): Promise<void> => {
  await apiClient.delete(`/patients/${id}`);
};