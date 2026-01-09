import apiClient from '@/api/axios';
import {
  CreatePostRequest,
  UpdatePostRequest,
  PostsByCategoryResponse,
  PaginatedNewArrivalsResponse,
} from '@/api/types/post';

export const createPost = async (request: CreatePostRequest) => {
  const { data } = await apiClient.post('/post/create', request);
  return data;
};

export const getPostsByCategory = async (
  slug: string,
  page: number
): Promise<PostsByCategoryResponse> => {
  const { data } = await apiClient.get<PostsByCategoryResponse>(
    `/category/?slug=${slug}&page=${page}&per_page=20`
  );
  return data;
};

export const getPostDetail = async (postId: string) => {
  const { data } = await apiClient.get(`/post/detail?post_id=${postId}`);
  return data;
};

export const getNewArrivals = async (
  page: number = 1,
  per_page: number = 20
): Promise<PaginatedNewArrivalsResponse> => {
  const { data } = await apiClient.get<PaginatedNewArrivalsResponse>(
    `/post/new-arrivals?page=${page}&per_page=${per_page}`
  );
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

export const getPostTimeSalePriceInfo = async (
  postId: string,
  page: number = 1,
  limit: number = 20
) => {
  const response = await apiClient.get(
    `/post/${postId}/price-time-sale?page=${page}&limit=${limit}`
  );
  return response;
};

export const createPostPriceTimeSale = async (postId: string, payload: Record<string, any>) => {
  const response = await apiClient.post(`/post/${postId}/create-price-time-sale`, payload);
  return response;
};

export const deletePostPriceTimeSale = async (timeSaleId: string) => {
  const response = await apiClient.delete(`/post/delete-price-time-sale/${timeSaleId}`);
  return response;
};


export const checkActiveTimeSale = async (postId: string, priceId: string) => {
  const response = await apiClient.get(`/post/${postId}/time-sale/${priceId}`);
  return response;
};