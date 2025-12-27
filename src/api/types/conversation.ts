// src/api/types/conversation.ts

export interface MessageCreate {
  body_text?: string | null;
  asset_storage_key?: string | null;
  asset_type?: number | null;
}

// メッセージアセット情報
export interface MessageAssetInfo {
  id: string;
  status: number; // 0=審査待ち, 1=承認済み, 2=拒否
  asset_type: number; // 1=画像, 2=動画
  cdn_url: string | null; // 承認済みの場合のみ
  storage_key: string;
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
  asset: MessageAssetInfo | null;
}

// Presigned URL リクエスト
export interface PresignedUrlRequest {
  asset_type: number; // 1=画像, 2=動画
  content_type: string; // MIMEタイプ
  file_extension: string; // 拡張子
}

// Presigned URL レスポンス
export interface PresignedUrlResponse {
  storage_key: string;
  upload_url: string;
  expires_in: number;
  required_headers: Record<string, string>;
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
  partner_profile_username: string | null;
  partner_avatar: string | null;
  can_send_message: boolean;
  current_user_is_creator: boolean;
  partner_user_is_creator: boolean;
  is_current_user_seller: boolean;
  is_current_user_buyer: boolean;
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
