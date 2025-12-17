import apiClient from '../axios';

export interface Banner {
  id: string;
  type: number; // 1=クリエイター, 2=イベント
  title: string;
  image_url: string | null;
  image_source: number | null; // 1=USER_PROFILE, 2=ADMIN_POST
  avatar_url: string | null;
  alt_text: string;
  creator_id: string | null;
  creator_username: string | null;
  creator_profile_name: string | null;
  external_url: string | null;
  display_order: number;
}

export interface PreRegisterUser {
  id: string;
  profile_name: string;
  username: string;
  avatar_url: string | null;
  cover_url: string | null;
}

export interface ActiveBannersResponse {
  banners: Banner[];
  pre_register_users: PreRegisterUser[];
}

/**
 * 現在有効なバナー一覧を取得
 */
export const getActiveBanners = async (ac: AbortSignal): Promise<ActiveBannersResponse> => {
  const response = await apiClient.get<ActiveBannersResponse>('/banners/active', { signal: ac });
  return response.data;
};
