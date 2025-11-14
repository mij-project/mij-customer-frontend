import axios from 'axios';
import type { SearchParams, SearchResponse, SearchHistoryResponse } from './types/search';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * 統合検索
 */
export const searchContent = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await axios.get(`${API_BASE_URL}/search`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

/**
 * 検索履歴取得
 */
export const getSearchHistory = async (limit: number = 10): Promise<SearchHistoryResponse> => {
  const response = await axios.get(`${API_BASE_URL}/search/history`, {
    params: { limit },
    withCredentials: true,
  });
  return response.data;
};

/**
 * 検索履歴削除 (個別)
 */
export const deleteSearchHistoryItem = async (historyId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/search/history/${historyId}`, {
    withCredentials: true,
  });
};

/**
 * 検索履歴全削除
 */
export const deleteAllSearchHistory = async (): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/search/history`, {
    withCredentials: true,
  });
};
