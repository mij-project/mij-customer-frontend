// src/api/endpoints/passwordReset.ts
import apiClient from '@/api/axios';

/**
 * パスワードリセット申請
 * @param email メールアドレス
 * @returns レスポンス
 */
export const requestPasswordReset = (email: string) =>
  apiClient.post('/auth/password-reset/request', { email });

/**
 * パスワードリセット確認・更新
 * @param token リセットトークン
 * @param newPassword 新しいパスワード
 * @returns レスポンス
 */
export const confirmPasswordReset = (token: string, newPassword: string) =>
  apiClient.post('/auth/password-reset/confirm', {
    token,
    new_password: newPassword,
  });
