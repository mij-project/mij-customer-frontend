import apiClient from '@/api/axios';
import { UserProviderListResponse } from '@/api/types/userProvider';

/**
 * ユーザープロバイダー情報を取得
 * @returns UserProviderListResponse
 */
export const getUserProviders = async (): Promise<UserProviderListResponse> => {
  const { data } = await apiClient.get<UserProviderListResponse>('/user-provider/');
  return data;
};
