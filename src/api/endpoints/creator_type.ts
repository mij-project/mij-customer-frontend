import apiClient from '@/api/axios';
import { CreatorTypeOut } from '@/api/types/creatorr_type';

export const getCreatorTypes = async (): Promise<CreatorTypeOut[]> => {
  const response = await apiClient.get('/creator-type/');
  return response.data;
};

export const createCreatorType = async (gender_slugs: string[]): Promise<any> => {
    console.log(gender_slugs);
    const response = await apiClient.post(`/creator-type/`, {
        gender_slug_list: gender_slugs,
    });
    return response.data;
};