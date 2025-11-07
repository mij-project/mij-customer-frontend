import apiClient from '@/api/axios';
import { GenderOut } from '@/api/types/gender';

export const getGenders = async (): Promise<GenderOut[]> => {
  const response = await apiClient.get('/gender/');
  return response.data;
};
