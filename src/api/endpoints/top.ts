import apiClient from '@/api/axios';
import { TopPageData } from '@/api/types/type';

export const getTopPageData = (ac: AbortSignal): Promise<TopPageData> => {
  return apiClient.get('/top/', { signal: ac }).then((response) => response.data);
};
