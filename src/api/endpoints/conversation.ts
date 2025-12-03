// src/api/endpoints/conversation.ts
import apiClient from '@/api/axios';
import { MessageCreate, MessageResponse, ConversationResponse } from '@/api/types/conversation';

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