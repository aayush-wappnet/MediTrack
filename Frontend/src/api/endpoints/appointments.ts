import apiClient from '../apiClient';
import type { Appointment, CreateAppointmentDto, UpdateAppointmentDto, CancelAppointmentDto, RejectAppointmentDto } from '../types/appointments.types';

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await apiClient.get<Appointment[]>('/appointments');
  return response.data;
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
  const response = await apiClient.get<Appointment>(`/appointments/${id}`);
  return response.data;
};

export const createAppointment = async (data: CreateAppointmentDto): Promise<Appointment> => {
  const response = await apiClient.post<Appointment>('/appointments', data);
  return response.data;
};

export const updateAppointment = async (id: string, data: UpdateAppointmentDto): Promise<Appointment> => {
  const response = await apiClient.patch<Appointment>(`/appointments/${id}`, data);
  return response.data;
};

export const approveAppointment = async (id: string): Promise<Appointment> => {
  const response = await apiClient.patch<Appointment>(`/appointments/${id}/approve`, {});
  return response.data;
};

export const rejectAppointment = async (id: string, data: RejectAppointmentDto): Promise<Appointment> => {
  const response = await apiClient.patch<Appointment>(`/appointments/${id}/reject`, data);
  return response.data;
};

export const cancelAppointment = async (id: string, data: CancelAppointmentDto): Promise<Appointment> => {
  const response = await apiClient.patch<Appointment>(`/appointments/${id}/cancel`, data);
  return response.data;
};

export const deleteAppointment = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/appointments/${id}`);
  return response.data;
};