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
export const getMyMessageAssetDetail = (groupBy: string) =>
  apiClient.get<UserMessageAssetDetailResponse>(`/users/me/message-assets/${groupBy}`);

// group_byベースでPresigned URL取得
export const getMessageAssetUploadUrlByGroupBy = (
  groupBy: string,
  request: {
    asset_type: number;
    content_type: string;
    file_extension: string;
  }
) =>
  apiClient.post<import('@/api/types/conversation').PresignedUrlResponse>(
    `/users/me/message-assets/${groupBy}/upload-url`,
    request
  );

// メッセージアセットを再申請
export const resubmitMessageAsset = (
  groupBy: string,
  data: {
    message_text?: string;
    asset_storage_key?: string | null;
    asset_type?: number | null;
    scheduled_at?: string;
    is_new_file_selected?: boolean;
  }
) =>
  apiClient.put<UserMessageAssetDetailResponse>(
    `/users/me/message-assets/${groupBy}/resubmit`,
    data
  );

// メッセージアセットを削除
export const deleteReservedMessage = (groupBy: string) =>
  apiClient.delete<void>(`/users/me/message-assets/${groupBy}`);