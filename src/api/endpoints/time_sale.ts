import apiClient from '@/api/axios';
import { TimeSaleEditInitResponse } from '@/api/types/time_sale';

export const getPostPriceTimeSaleEditByTimeSaleId = async (
  timeSaleId: string
): Promise<TimeSaleEditInitResponse> => {
  const response = await apiClient.get<TimeSaleEditInitResponse>(
    `/time-sale/timesale-edit/${timeSaleId}`
  );
  return response.data;
};

export const updateTimeSale = async (timeSaleId: string, request: Record<string, any>): Promise<void> => {
  const response = await apiClient.put<void>(`/time-sale/update-time-sale/${timeSaleId}`, request);
  return response.data;
};