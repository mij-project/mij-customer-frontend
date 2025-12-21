import apiClient from '@/api/axios';
import { CreatePostRequest, UpdatePostRequest, PostsByCategoryResponse, PaginatedNewArrivalsResponse } from '@/api/types/post';

export const createPost = async (request: CreatePostRequest) => {
  const { data } = await apiClient.post('/post/create', request);
  return data;
};

export const getPostsByCategory = async (slug: string, page: number): Promise<PostsByCategoryResponse> => {
  const { data } = await apiClient.get<PostsByCategoryResponse>(`/category/?slug=${slug}&page=${page}&per_page=20`);
  return data;
};

export const getPostDetail = async (postId: string) => {
  const { data } = await apiClient.get(`/post/detail?post_id=${postId}`);
  return data;
};

export const getNewArrivals = async (page: number = 1, per_page: number = 20): Promise<PaginatedNewArrivalsResponse> => {
  const { data } = await apiClient.get<PaginatedNewArrivalsResponse>(`/post/new-arrivals?page=${page}&per_page=${per_page}`);
  return data;
};

export const updatePost = async (request: UpdatePostRequest) => {
  const { data } = await apiClient.put(`/post/update`, request);
  return data;
};

export const getPostOgpImage = async (
  postId: string
): Promise<{ ogp_image_url: string | null }> => {
  const { data } = await apiClient.get(`/post/${postId}/ogp-image`);
  return data;
};

export const deletePost = async (postId: string) => {
  const { data } = await apiClient.delete(`/post/${postId}`);
  return data;
};