import apiClient from '@/api/axios';
import { CreatePostRequest, UpdatePostRequest } from '@/api/types/post';

export const createPost = async (request: CreatePostRequest) => {
  const { data } = await apiClient.post('/post/create', request);
  return data;
};

export const getPostsByCategory = async (slug: string, page: number) => {
  const { data } = await apiClient.get(`/category/?slug=${slug}&page=${page}&per_page=20`);
  return data;
};

export const getPostDetail = async (postId: string) => {
  const { data } = await apiClient.get(`/post/detail?post_id=${postId}`);
  return data;
};

export const getNewArrivals = async () => {
  const { data } = await apiClient.get(`/post/new-arrivals`);
  return data;
};

export const updatePost = async (request: UpdatePostRequest) => {
  const { data } = await apiClient.put(`/post/update`, request);
  return data;
};

export const getPostOgpImage = async (postId: string): Promise<{ ogp_image_url: string | null }> => {
  const { data } = await apiClient.get(`/post/${postId}/ogp-image`);
  return data;
};
