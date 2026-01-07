import apiClient from '@/api/axios';

export const getPaymentHistories = async (
  page: number,
  perPage: number = 20,
  period: string = 'today'
) => {
  const response = await apiClient.get('/users/payment-histories', {
    params: { page, per_page: perPage, period },
  });
  return response;
};
