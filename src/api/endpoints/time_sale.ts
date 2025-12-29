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
