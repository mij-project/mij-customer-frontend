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
