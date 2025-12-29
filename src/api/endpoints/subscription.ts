import apiClient from '@/api/axios';

export const cancelSubscription = async (planId: string) => {
  const response = await apiClient.put(`/subscriptions/cancel/${planId}`);
  return response.data;
};

export interface FreeSubscriptionRequest {
  purchase_type: number; // 1=SINGLE, 2=SUBSCRIPTION
  order_id: string; // プランIDまたはpriceID
}

export interface FreeSubscriptionResponse {
  result: boolean;
  subscription_id: string;
  message: string;
}

/**
 * 0円プラン・商品への加入
 */
export const createFreeSubscription = async (
  data: FreeSubscriptionRequest
): Promise<FreeSubscriptionResponse> => {
  const response = await apiClient.post('/subscriptions/free', data);
  return response.data;
};
