// src/api/endpoints/message_assets.ts
import apiClient from '@/api/axios';
import {
  UserMessageAssetResponse,
  UserMessageAssetDetailResponse,
} from '@/api/types/message_asset';

// 自分が送信したメッセージアセット一覧を取得
export const getMyMessageAssets = (params?: {
  skip?: number;
  limit?: number;
}) =>
  apiClient.get<UserMessageAssetResponse>('/users/me/message-assets', { params });

// 自分が送信したメッセージアセットの詳細を取得
export const getMyMessageAssetDetail = (assetId: string) =>
  apiClient.get<UserMessageAssetDetailResponse>(`/users/me/message-assets/${assetId}`);

// メッセージアセットを再申請
export const resubmitMessageAsset = (
  assetId: string,
  data: {
    message_text?: string;
    asset_storage_key: string;
    asset_type: number;
  }
) =>
  apiClient.put<UserMessageAssetDetailResponse>(
    `/users/me/message-assets/${assetId}/resubmit`,
    data
  );
