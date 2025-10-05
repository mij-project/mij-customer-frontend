import apiClient from '@/api/axios';
import { PurchaseRequest } from '@/api/types/purchases';

export const createPurchase = async (request: PurchaseRequest) => {
  const { data } = await apiClient.post('/purchases/create', request);
  return data;
};