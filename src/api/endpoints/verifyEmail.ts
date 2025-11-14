import apiClient from '@/api/axios';
import { VerifyEmailRequest } from '@/api/types/verifyEmail';

export const verifyCheck = async (token: string, code?: string) => {
  const controller = new AbortController();
  const response = await apiClient.post(
    '/auth/email/verify/',
    { token, code },
    { signal: controller.signal, timeout: 10000 }
  );
  return response.data;
};

/**
 * メール認証の再送信
 * @param email メールアドレス
 * @returns 再送信結果
 */
export const resendVerificationEmail = async (request: VerifyEmailRequest) => {
  const response = await apiClient.post('/auth/email/resend', request);
  return response.data;
};
