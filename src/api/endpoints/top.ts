import apiClient from '@/api/axios';
import { TopPageData } from '@/api/types/type';

export const getTopPageData = (): Promise<TopPageData> => {
  return apiClient.get('/top/').then((response) => response.data);
};
