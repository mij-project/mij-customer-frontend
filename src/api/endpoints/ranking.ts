import apiClient from '@/api/axios';

export const getPostsRankingOverall = async () => {
  const { data } = await apiClient.get('/ranking/posts?type=overall');
  return data;
};

export const getPostsRankingGenres = async () => {
  const { data } = await apiClient.get('/ranking/posts?type=genres');
  return data;
};

export const getPostsRankingDetail = async (
  genre: string,
  term: string,
  page: number,
  per_page: number
) => {
  const { data } = await apiClient.get('/ranking/posts/detail', {
    params: { genre: genre, term: term, page: page, per_page: per_page },
  });
  return data;
};

export const getCreatorsRankingOverall = async () => {
  const response = await apiClient.get('/ranking/creators');
  return response;
};

export const getCreatorsRankingDetail = async (term: string, page: number, per_page: number) => {
  const response = await apiClient.get('/ranking/creators/detail', {
    params: { term: term, page: page, per_page: per_page },
  });
  return response;
};
