import apiClient from '@/api/axios';

export const verifyCheck = async (token: string, code?: string) => {
  const controller = new AbortController();
  const response = await apiClient.post(
    '/auth/email/verify/',
    { token, code },
    { signal: controller.signal, timeout: 10000 }
  );
  return response.data;
};
