// src/api/types/message_asset.ts

export interface UserMessageAsset {
  id: string;
  message_id: string;
  conversation_id: string;
  asset_type: number; // 1=画像, 2=動画
  storage_key: string;
  cdn_url: string | null;
  reject_comments: string | null;
  created_at: string;
  updated_at: string;

  // メッセージ情報
  message_text: string | null;

  // 相手の情報
  partner_user_id: string | null;
  partner_username: string | null;
  partner_profile_name: string | null;
  partner_avatar: string | null;
}

export interface UserMessageAssetResponse {
  pending_message_assets: UserMessageAsset[]; // 審査待ち (status=0相当)
  reject_message_assets: UserMessageAsset[]; // 拒否 (status=2相当)
}

export interface UserMessageAssetDetailResponse {
  id: string;
  message_id: string;
  conversation_id: string;
  status: number; // 0=審査待ち, 1=承認済み, 2=拒否
  asset_type: number; // 1=画像, 2=動画
  storage_key: string;
  cdn_url: string | null;
  reject_comments: string | null;
  created_at: string;
  updated_at: string;

  // メッセージ全文
  message_text: string | null;
  message_created_at: string | null;

  // 相手の情報
  partner_user_id: string | null;
  partner_username: string | null;
  partner_profile_name: string | null;
  partner_avatar: string | null;
}
