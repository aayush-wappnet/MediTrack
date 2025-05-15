import apiClient from '../apiClient';
import type { Diagnosis } from '../types/diagnoses.types';

export const getDiagnoses = async (): Promise<Diagnosis[]> => {
  const response = await apiClient.get<Diagnosis[]>('/diagnoses');
  return response.data;
};

export const getDiagnosisById = async (id: string): Promise<Diagnosis> => {
  const response = await apiClient.get<Diagnosis>(`/diagnoses/${id}`);
  return response.data;
};

export const createDiagnosis = async (data: Partial<Diagnosis>): Promise<Diagnosis> => {
  const response = await apiClient.post<Diagnosis>('/diagnoses', data);
  return response.data;
};

export const updateDiagnosis = async (id: string, data: Partial<Diagnosis>): Promise<Diagnosis> => {
  const response = await apiClient.patch<Diagnosis>(`/diagnoses/${id}`, data);
  return response.data;
};

export const deleteDiagnosis = async (id: string): Promise<void> => {
  await apiClient.delete(`/diagnoses/${id}`);
};