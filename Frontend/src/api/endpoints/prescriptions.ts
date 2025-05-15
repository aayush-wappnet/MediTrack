import apiClient from '../apiClient';
import type { Prescription, PrescriptionStatus, Medication } from '../types/prescriptions.types';

const API_URL = '/prescriptions'; // Base URL is already set in apiClient

export const getPrescriptions = async (status?: PrescriptionStatus): Promise<Prescription[]> => {
  const response = await apiClient.get<Prescription[]>(API_URL, {
    params: { status },
  });
  return response.data;
};

export const getPrescriptionById = async (id: string): Promise<Prescription> => {
  const response = await apiClient.get<Prescription>(`${API_URL}/${id}`);
  return response.data;
};

export const getPrescriptionQueue = async (): Promise<Prescription[]> => {
  const response = await apiClient.get<Prescription[]>(`${API_URL}/queue`);
  return response.data;
};

export type PrescriptionPayload = Omit<Partial<Prescription>, 'medications'> & {
  medications?: Omit<Medication, 'id' | 'prescription'>[];
};

export const createPrescription = async (data: PrescriptionPayload): Promise<Prescription> => {
  const response = await apiClient.post<Prescription>(API_URL, data);
  return response.data;
};

export const updatePrescription = async (id: string, data: PrescriptionPayload): Promise<Prescription> => {
  const response = await apiClient.patch<Prescription>(`${API_URL}/${id}`, data);
  return response.data;
};

export const fulfillPrescription = async (id: string): Promise<Prescription> => {
  const response = await apiClient.patch<Prescription>(`${API_URL}/${id}/fulfill`, {});
  return response.data;
};

export const deletePrescription = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_URL}/${id}`);
};