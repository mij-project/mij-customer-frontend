// src/api/endpoints/bulk_messages.ts
import apiClient from '@/api/axios';
import {
  BulkMessageRecipientsResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
  BulkMessageSendRequest,
  BulkMessageSendResponse,
} from '@/api/types/bulk_message';

/**
 * 一斉送信の送信先リスト情報を取得
 */
export const getBulkMessageRecipients = () =>
  apiClient.get<BulkMessageRecipientsResponse>('/bulk-messages/recipients');

/**
 * 一斉送信用メッセージアセットのPresigned URL取得
 */
export const getBulkMessageUploadUrl = (request: PresignedUrlRequest) =>
  apiClient.post<PresignedUrlResponse>('/bulk-messages/upload-url', request);

/**
 * 一斉メッセージ送信
 */
export const sendBulkMessage = (request: BulkMessageSendRequest) =>
  apiClient.post<BulkMessageSendResponse>('/bulk-messages/', request);
