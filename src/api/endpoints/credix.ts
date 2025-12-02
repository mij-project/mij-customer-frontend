/**
 * CREDIX決済APIクライアント
 */
import apiClient from '@/api/axios';
import {
  CredixSessionRequest,
  CredixSessionResponse,
  CredixPaymentResultResponse,
} from '@/api/types/credix';

/**
 * CREDIXセッション作成
 * @param request セッション作成リクエスト
 * @returns セッション情報（session_id, payment_url, transaction_id等）
 */
export const createCredixSession = async (
  request: CredixSessionRequest
): Promise<CredixSessionResponse> => {

  console.log(request);
  const response = await apiClient.post<CredixSessionResponse>(
    '/payments/credix/session',
    request
  );
  return response.data;
};

/**
 * CREDIX決済結果確認
 * @param transactionId トランザクションID
 * @returns 決済結果（status, result, payment_id, subscription_id等）
 */
export const getCredixPaymentResult = async (
  transactionId: string
): Promise<CredixPaymentResultResponse> => {
  const response = await apiClient.get<CredixPaymentResultResponse>(
    `/payments/credix/result/${transactionId}`
  );
  return response.data;
};
