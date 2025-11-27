import apiClient from '@/api/axios';

export const getPostsRankingOverall = async () => {
  const { data } = await apiClient.get('/ranking/posts?type=overall');
  return data;
};

export const getPostsRankingCategories = async () => {
  const { data } = await apiClient.get('/ranking/posts?type=categories');
  return data;
};

export const getPostsRankingDetail = async (
  category: string,
  term: string,
  page: number,
  per_page: number
) => {
  const { data } = await apiClient.get('/ranking/posts/detail', {
    params: { category: category, term: term, page: page, per_page: per_page },
  });
  return data;
};

export const getCreatorsRankingOverall = async () => {
  const response = await apiClient.get('/ranking/creators?type=overall');
  return response;
};

export const getCreatorsRankingCategories = async () => {
  const response = await apiClient.get('/ranking/creators?type=categories');
  return response;
};

export const getCreatorsRankingDetail = async (
  category: string,
  term: string,
  page: number,
  per_page: number
) => {
  const response = await apiClient.get('/ranking/creators/detail', {
    params: { category: category, term: term, page: page, per_page: per_page },
  });
  return response;
};
