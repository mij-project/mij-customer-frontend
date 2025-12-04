import apiClient from '@/api/axios';

export const debugCookies = async (): Promise<{ cookies: string }> => {
  const res = await apiClient.get('/api/debug-cookies', { withCredentials: true });
  return res.data;
};
