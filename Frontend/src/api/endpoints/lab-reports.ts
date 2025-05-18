import apiClient from '../apiClient';
import type { LabReport, CreateLabReportPayload, UpdateLabReportPayload } from '../types/lab-reports.types';
import { LabReportStatus } from '../types/lab-reports.types';

export { LabReportStatus };

export const getLabReports = async (status?: LabReportStatus): Promise<LabReport[]> => {
  const response = await apiClient.get<LabReport[]>('/lab-reports', { params: { status } });
  return response.data;
};

export const getPendingLabReports = async (): Promise<LabReport[]> => {
  const response = await apiClient.get<LabReport[]>('/lab-reports/pending');
  return response.data;
};

export const getLabReportById = async (id: string): Promise<LabReport> => {
  const response = await apiClient.get<LabReport>(`/lab-reports/${id}`);
  return response.data;
};

export const createLabReport = async (payload: CreateLabReportPayload): Promise<LabReport> => {
  const response = await apiClient.post<LabReport>('/lab-reports', payload);
  return response.data;
};

export const updateLabReport = async (id: string, payload: UpdateLabReportPayload): Promise<LabReport> => {
  const response = await apiClient.patch<LabReport>(`/lab-reports/${id}`, payload);
  return response.data;
};

export const uploadLabReportResults = async (id: string, payload: UpdateLabReportPayload): Promise<LabReport> => {
  const response = await apiClient.patch<LabReport>(`/lab-reports/${id}/upload`, payload);
  return response.data;
};

export const deleteLabReport = async (id: string): Promise<void> => {
  await apiClient.delete(`/lab-reports/${id}`);
};