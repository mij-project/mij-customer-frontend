import apiClient from '@/api/axios';
import {
  AccountInfo,
  ProfileEditInfo,
  AccountUpdateRequest,
  AccountPresignedUrlRequest,
  AccountPresignedUrlResponse,
  AccountPostStatusResponse,
  AccountPostDetailResponse,
  AccountPostUpdateRequest,
  AccountPostUpdateResponse,
  ProfileImageSubmissionRequest,
  ProfileImageSubmission,
  ProfileImageStatusResponse
} from '@/api/types/account';
import { PlanListResponse } from '@/api/types/plan';
import { PlanInfo } from '@/api/types/account';
import { UpdatePostRequest } from '@/api/types/post';

/**
 * アカウント情報を取得
 * @returns AccountInfo
 */
export const getAccountInfo = (): Promise<AccountInfo> => {
  return apiClient.get('/account/info').then(response => response.data);
};

/**
 * プロフィール編集用の情報を取得（軽量版）
 * @returns ProfileEditInfo
 */
export const getProfileEditInfo = (): Promise<ProfileEditInfo> => {
  return apiClient.get('/account/profile').then(response => response.data);
};

/**
 * アカウント情報を更新
 * @param data 
 * @returns 
 */
export const updateAccountInfo = (data: AccountUpdateRequest) => {
  return apiClient.put('/account/update', data).then(response => response.data);
};

/**
 * presigned URL を取得
 * @param request 
 * @returns AccountPresignedUrlResponse
 */
export const accountPresignedUrl = async (request: AccountPresignedUrlRequest) => {
  const { data } = await apiClient.post<AccountPresignedUrlResponse>('/account/presign-upload', request);
  return data;
};

/** 
 * アカウントの投稿を取得
 * @returns AccountPostStatusResponse
 */
export const getAccountPosts = async (): Promise<AccountPostStatusResponse> => {
  const { data } = await apiClient.get<AccountPostStatusResponse>('/account/posts');
  return data;
};

/**
 * アカウントのプランを取得
 * @returns AccountPlanResponse
 */
export const getAccountPlan = async (): Promise<PlanInfo> => {
  const { data } = await apiClient.get<PlanInfo>('/account/plans');
  return data;
};

/**
 * ブックマークした投稿一覧を取得
 * @returns BookmarkedPostsResponse
 */
export const getBookmarkedPosts = async () => {
  const { data } = await apiClient.get('/account/bookmarks');
  return data;
};

/**
 * いいねした投稿一覧を取得
 * @returns LikedPostsListResponse
 */
export const getLikedPosts = async () => {
  const { data } = await apiClient.get('/account/likes');
  return data;
};

/**
 * 購入済み投稿一覧を取得
 * @returns BoughtPostsResponse
 */
export const getBoughtPosts = async () => {
  const { data } = await apiClient.get('/account/bought');
  return data;
};

/**
 * プロフィール画像を申請
 * @param request 申請内容
 * @returns ProfileImageSubmission
 */
export const submitProfileImage = async (request: ProfileImageSubmissionRequest): Promise<ProfileImageSubmission> => {
  const { data } = await apiClient.post<ProfileImageSubmission>('/account/profile-image/submit', request);
  return data;
};

/**
 * プロフィール画像の申請状況を取得
 * @returns ProfileImageStatusResponse
 */
export const getProfileImageStatus = async (): Promise<ProfileImageStatusResponse> => {
  const { data } = await apiClient.get<ProfileImageStatusResponse>('/account/profile-image/status');
  return data;
};

/**
 * 投稿詳細を取得（クリエイター自身の投稿）
 * @param postId 投稿ID
 * @returns AccountPostDetailResponse
 */
export const getAccountPostDetail = async (postId: string): Promise<AccountPostDetailResponse> => {
  const { data } = await apiClient.get<AccountPostDetailResponse>(`/account/post/${postId}`);
  return data;
};

/**
 * 投稿を更新（非公開化、削除、編集など）
 * @param postId 投稿ID
 * @param request 更新内容
 * @returns AccountPostUpdateResponse
 */
export const updateAccountPost = async (
  postId: string,
  request: AccountPostUpdateRequest
): Promise<AccountPostUpdateResponse> => {
  const { data } = await apiClient.put<AccountPostUpdateResponse>(`/account/post/${postId}`, request);
  return data;
};