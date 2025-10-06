import apiClient from '@/api/axios';

export const verifyCheck = async (token: string) => {
	const controller = new AbortController();
  const response = await apiClient.post('/auth/email/verify/', 
		{ token },
		{ signal: controller.signal, timeout: 10000 }
	);
  return response.data;
};