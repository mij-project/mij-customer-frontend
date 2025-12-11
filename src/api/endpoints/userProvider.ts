import apiClient from '@/api/axios';
import { UserProviderListResponse, UserProvider } from '@/api/types/userProvider';

/**
 * ユーザープロバイダー情報を取得
 * @returns UserProviderListResponse
 */
export const getUserProviders = async (): Promise<UserProviderListResponse> => {
  const { data } = await apiClient.get<UserProviderListResponse>('/user-provider/');
  return data;
};

/**
 * ユーザープロバイダーをメインカードに設定
 * @param providerId - プロバイダーID
 * @returns 更新されたUserProvider
 */
export const setMainCard = async (providerId: string): Promise<UserProvider> => {
  const { data } = await apiClient.patch<UserProvider>(`/user-provider/${providerId}/set-main`);
  return data;
};

/**
 * ユーザープロバイダーを削除
 * @param providerId - プロバイダーID
 */
export const deleteUserProvider = async (providerId: string): Promise<void> => {
  await apiClient.delete(`/user-provider/${providerId}`);
};
