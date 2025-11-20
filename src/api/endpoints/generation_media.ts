import apiClient from '@/api/axios';

export const generateMediaPresignedUrl = async (post_id: string) => {
  await apiClient.post(`/generation-media/create/${post_id}`);
};