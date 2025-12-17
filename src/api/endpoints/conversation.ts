// src/api/endpoints/conversation.ts
import apiClient from '@/api/axios';
import {
  MessageCreate,
  MessageResponse,
  ConversationResponse,
  UserConversationsResponse
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
export const getConversationUnread = () =>
  apiClient.get('/conversations/unread');

// ========== ユーザーの会話リストAPI ==========

// ユーザーの会話リストを取得
export const getUserConversations = (params: {
  skip?: number;
  limit?: number;
  search?: string;
  sort?: string;
  unread_only?: boolean;
}) =>
  apiClient.get<UserConversationsResponse>('/conversations/list', { params });

// ========== 個別会話のメッセージAPI ==========

// 会話のメッセージ一覧を取得
export const getConversationMessages = (conversationId: string, skip = 0, limit = 50) =>
  apiClient.get<MessageResponse[]>(`/conversations/${conversationId}/messages?skip=${skip}&limit=${limit}`);

// メッセージを送信
export const sendConversationMessage = (conversationId: string, message: MessageCreate) =>
  apiClient.post<MessageResponse>(`/conversations/${conversationId}/messages`, message);

// メッセージを既読にする
export const markMessageAsRead = (conversationId: string, messageId: string) =>
  apiClient.post(`/conversations/${conversationId}/messages/${messageId}/read`);