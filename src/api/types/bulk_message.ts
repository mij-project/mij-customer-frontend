// src/api/types/bulk_message.ts

export interface BulkMessageRecipientsResponse {
  chip_senders_count: number;
  single_purchasers_count: number;
  plan_subscribers: PlanSubscriber[];
}

export interface PlanSubscriber {
  plan_id: string;
  plan_name: string;
  subscribers_count: number;
}

export interface PresignedUrlRequest {
  asset_type: number; // 1=画像, 2=動画
  content_type: string;
  file_extension: string;
}

export interface PresignedUrlResponse {
  storage_key: string;
  upload_url: string;
  expires_in: number;
  required_headers: Record<string, string>;
}

export interface BulkMessageSendRequest {
  message_text: string;
  asset_storage_key?: string | null;
  asset_type?: number | null;
  send_to_chip_senders: boolean;
  send_to_single_purchasers: boolean;
  send_to_plan_subscribers: string[]; // UUID配列
  scheduled_at?: string | null; // ISO 8601 UTC
}

export interface BulkMessageSendResponse {
  message: string;
  sent_count: number;
  scheduled: boolean;
  scheduled_at?: string | null;
}
