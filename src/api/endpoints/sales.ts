import apiClient from '@/api/axios';
import { WithdrawalApplicationRequest } from '@/api/types/sales';

export const getCreatorsSalesSummary = async () => {
  const response = await apiClient.get("/creator/sales/sales-summary");
  return response;
};

export const getCreatorsSalesPeriodData = async (period: string) => {
  const response = await apiClient.get(`/creator/sales/sales-period?period=${period}`);
  return response;
};

export const getCreatorsSalesHistory = async (page: number, limit: number, period: string) => {
  const response = await apiClient.get(`/creator/sales/sales-history?page=${page}&limit=${limit}&period=${period}`);
  return response;
};

export const submitWithdrawalApplication = async (request: WithdrawalApplicationRequest) => {
  const response = await apiClient.post('/creator/sales/withdrawal-application', request);
  return response;
};

export const getWithdrawalHistories = async (page: number) => {
  const response = await apiClient.get(`/creator/sales/withdrawal-histories`, { params: { page: page, limit: 20 } });
  return response;
};