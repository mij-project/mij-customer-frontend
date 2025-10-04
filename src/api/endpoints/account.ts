import apiClient from '@/api/axios';
import { 
  AccountInfo, 
  AccountUpdateRequest, 
  AccountPresignedUrlRequest, 
  AccountPresignedUrlResponse,
  AccountPostStatusResponse
} from '@/api/types/account';
import { PlanListResponse } from '@/api/types/plan';
import { PlanInfo } from '@/api/types/account';

/**
 * アカウント情報を取得
 * @returns AccountInfo
 */
export const getAccountInfo = (): Promise<AccountInfo> => {
  return apiClient.get('/account/info').then(response => response.data);
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