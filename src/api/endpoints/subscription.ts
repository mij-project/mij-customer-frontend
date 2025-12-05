import apiClient from '@/api/axios';

export const cancelSubscription = async (planId: string) => {
  const response = await apiClient.put(`/subscriptions/cancel/${planId}`);
  return response.data;
};	