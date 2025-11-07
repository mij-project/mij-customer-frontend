import apiClient from '@/api/axios';

export const getRanking = async () => {
  const { data } = await apiClient.get('/ranking/');
  return data;
};
