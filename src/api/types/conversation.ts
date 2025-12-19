// src/api/types/conversation.ts

export interface MessageCreate {
  body_text: string;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  sender_user_id: string | null;
  sender_admin_id: string | null;
  type: number;
  body_text: string | null;
  created_at: string;
  updated_at: string;
  sender_username: string | null;
  sender_avatar: string | null;
  sender_profile_name: string | null;
}

export interface ConversationResponse {
  id: string;
  type: number;
  is_active: boolean;
  last_message_id: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  last_message_text: string | null;
  unread_count: number;
}

export interface ConversationListResponse {
  id: string;
  user_id: string;
  user_username: string | null;
  user_profile_name: string | null;
  user_avatar: string | null;
  last_message_text: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export interface MarkAsReadRequest {
  message_id: string;
}

// 会話メッセージレスポンス（相手のプロフィール情報を含む）
export interface ConversationMessagesResponse {
  messages: MessageResponse[];
  partner_user_id: string | null;
  partner_username: string | null;
  partner_profile_name: string | null;
  partner_avatar: string | null;
  can_send_message: boolean;
}

// WebSocketメッセージ型
export interface WSMessage {
  type: 'connected' | 'new_message' | 'error' | 'pong' | 'read_confirmed';
  conversation_id?: string;
  message?: string | MessageResponse;
}

export interface WSSendMessage {
  type: 'message' | 'ping' | 'mark_read';
  body_text?: string;
  message_id?: string;
}

// ユーザーの会話リスト型
export interface UserConversation {
  id: string;
  partner_user_id: string;
  partner_name: string;
  partner_avatar: string | null;
  last_message_text: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

// ユーザーの会話リストレスポンス型
export interface UserConversationsResponse {
  data: UserConversation[];
  total: number;
  skip: number;
  limit: number;
}
