// src/api/endpoints/conversation.ts
import apiClient from '@/api/axios';
import {
  MessageCreate,
  MessageResponse,
  ConversationResponse,
  UserConversationsResponse,
  ConversationMessagesResponse,
} from '@/api/types/conversation';

// ========== 妄想メッセージAPI ==========

// 会話を取得または作成
export const getOrCreateDelusionConversation = () =>
  apiClient.get<ConversationResponse>('/conversations/delusion');

// メッセージ一覧を取得
export const getDelusionMessages = (skip = 0, limit = 50) =>
  apiClient.get<MessageResponse[]>(`/conversations/delusion/messages?skip=${skip}&limit=${limit}`);

// メッセージを送信
export const sendDelusionMessage = (message: MessageCreate) =>
  apiClient.post<MessageResponse>('/conversations/delusion/messages', message);

// 未読メッセージ数を取得
export const getConversationUnread = () => apiClient.get('/conversations/unread');

// 未読会話数を取得
export const getConversationUnreadCount = () =>
  apiClient.get<{ unread_count: number }>('/conversations/unread-count');

// ========== ユーザーの会話リストAPI ==========

// ユーザーの会話リストを取得
export const getUserConversations = (params: {
  skip?: number;
  limit?: number;
  search?: string;
  sort?: string;
  unread_only?: boolean;
}) => apiClient.get<UserConversationsResponse>('/conversations/list', { params });

// ========== 個別会話のメッセージAPI ==========

// 会話のメッセージ一覧を取得
export const getConversationMessages = (conversationId: string, skip = 0, limit = 50) =>
  apiClient.get<ConversationMessagesResponse>(
    `/conversations/${conversationId}/messages?skip=${skip}&limit=${limit}`
  );

// メッセージを送信
export const sendConversationMessage = (conversationId: string, message: MessageCreate) =>
  apiClient.post<MessageResponse>(`/conversations/${conversationId}/messages`, message);

// メッセージを既読にする
export const markMessageAsRead = (conversationId: string, messageId: string) =>
  apiClient.post(`/conversations/${conversationId}/messages/${messageId}/read`);

// 指定したユーザーとの会話を取得または作成
export const getOrCreateConversation = (partnerUserId: string) =>
  apiClient.get<{ conversation_id: string; partner_user_id: string }>(
    `/conversations/get-or-create/${partnerUserId}`
  );

// ========== メッセージアセットAPI ==========

// Presigned URL取得（アップロード用）
export const getMessageAssetUploadUrl = (
  conversationId: string,
  request: import('@/api/types/conversation').PresignedUrlRequest
) =>
  apiClient.post<import('@/api/types/conversation').PresignedUrlResponse>(
    `/conversations/${conversationId}/messages/upload-url`,
    request
  );

// S3へ直接アップロード
export const uploadToS3 = async (
  uploadUrl: string,
  file: File,
  headers: Record<string, string>,
  onProgress?: (progress: number) => void
) => {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // プログレスイベント
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('PUT', uploadUrl);

    // ヘッダーを設定
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.send(file);
  });
};
