import apiClient from '@/api/axios';
import { SignUpForm } from '@/api/types/user';
import { UserProfile } from '@/api/types/profile';

/**
 * 企業ユーザー登録
 * @param form 企業ユーザー登録フォーム
 * @returns 企業ユーザー登録結果
 */
export const signUpCompany = async (form: SignUpForm) => {
  console.log('form', form);
  const response = await apiClient.post('/users/register/company', form);
  return response.data;
};

/**
 * ユーザー登録
 * @param form ユーザー登録フォーム
 * @returns ユーザー登録結果
 */
export const signUp = async (form: SignUpForm) => {
  const response = await apiClient.post('/users/register', form);
  return response;
  return response.data;
};

/**
 * プロフィール名によるユーザープロフィール取得
 * @param profileName ユーザープロフィール名
 * @returns UserProfile
 */
export const getUserProfileByUsername = (username: string): Promise<UserProfile> => {
  return apiClient.get(`/users/profile?username=${username}`).then((response) => response.data);
};
