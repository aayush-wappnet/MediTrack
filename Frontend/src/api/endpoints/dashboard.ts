import apiClient from '../apiClient';
import { type DashboardStats } from '../types/dashboard.types';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
  }
}
