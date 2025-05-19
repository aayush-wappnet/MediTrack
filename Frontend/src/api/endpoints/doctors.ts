import apiClient from '../apiClient';
import type { Doctor } from '../types/doctors.types';

export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await apiClient.get<Doctor[]>('/doctors');
  return response.data;
};

export const getDoctorProfile = async (): Promise<Doctor> => {
  const response = await apiClient.get<Doctor>(`/doctors/profile`);
  return response.data;
};

export const updateDoctorProfile = async (doctor: Doctor): Promise<Doctor> => {
  const response = await apiClient.patch<Doctor>(`/doctors/profile`, doctor);
  return response.data;
};

export const deleteDoctor = async (id: string): Promise<void> => {
  await apiClient.delete(`/doctors/${id}`);
};

export const getDoctorById = async (id: string): Promise<Doctor> => {
  const response = await apiClient.get<Doctor>(`/doctors/${id}`);
  return response.data;
};
