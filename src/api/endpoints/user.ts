import apiClient from '@/api/axios';
import { SignUpForm } from '@/api/types/user';
import { UserProfile } from '@/api/types/profile';

export const signUp = async (form: SignUpForm) => {
  const response = await apiClient.post('/users/register', form);
  return response.data;
};

/**
 * プロフィール名によるユーザープロフィール取得
 * @param profileName ユーザープロフィール名
 * @returns UserProfile
 */
export const getUserProfileByUsername = (username: string): Promise<UserProfile> => {
  return apiClient.get(`/users/profile?username=${username}`).then(response => response.data);
};
