import apiClient from '@/api/axios';

export const getPostsRankingOverall = async (ac: AbortSignal) => {
  const { data } = await apiClient.get('/ranking/posts?type=overall', {
    signal: ac,
  });
  return data;
};

export const getPostsRankingCategories = async (ac: AbortSignal) => {
  const { data } = await apiClient.get('/ranking/posts?type=categories', {
    signal: ac,
  });
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

export const getCreatorsRankingOverall = async (ac: AbortSignal) => {
  const response = await apiClient.get('/ranking/creators?type=overall', {
    signal: ac,
  });
  return response;
};

export const getCreatorsRankingCategories = async (ac: AbortSignal) => {
  const response = await apiClient.get('/ranking/creators?type=categories', {
    signal: ac,
  });
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
