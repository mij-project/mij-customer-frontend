import apiClient from '@/api/axios';
import { PurchaseRequest, SalesData, SalesTransactionsResponse } from '@/api/types/purchases';

export const createPurchase = async (request: PurchaseRequest) => {
  const { data } = await apiClient.post('/purchases/create', request);
  return data;
};

/**
 * 売上データを取得
 * @param period 期間（"today", "monthly", "last_5_days"）
 * @returns SalesData
 */
export const getSalesData = async (period: string = 'today'): Promise<SalesData> => {
  const { data } = await apiClient.get<SalesData>('/purchases/sales', {
    params: { period }
  });
  return data;
};

/**
 * 売上履歴を取得
 * @param limit 取得件数（デフォルト50件）
 * @returns SalesTransactionsResponse
 */
export const getSalesTransactions = async (limit: number = 50): Promise<SalesTransactionsResponse> => {
  const { data } = await apiClient.get<SalesTransactionsResponse>('/purchases/transactions', {
    params: { limit }
  });
  return data;
};