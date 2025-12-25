// 決済関連APIエンドポイント
import apiClient from '@/api/axios';

export interface ChipPaymentRequest {
  recipient_user_id: string;
  amount: number;
  message?: string;
}

export interface CredixSessionResponse {
  session_id: string;
  payment_url: string;
  transaction_id: string;
}

// 投げ銭決済セッション発行
export const createChipPayment = (data: ChipPaymentRequest) =>
  apiClient.post<CredixSessionResponse>('/payments/credix/chip', data);
