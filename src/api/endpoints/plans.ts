import apiClient from '@/api/axios';
import {
  PlanCreateRequest,
  PlanUpdateRequest,
  Plan,
  PlanListResponse,
  PlanPostsResponse,
  PlanDetail,
  PlanPostsPaginatedResponse,
  PlanSubscriberListResponse,
  CreatorPostsForPlanResponse,
  PlanReorderRequest,
} from '@/api/types/plan';

export const createPlan = async (planData: PlanCreateRequest): Promise<Plan> => {
  const response = await apiClient.post<Plan>('/plans/create', planData);
  return response.data;
};

export const getPlans = async (): Promise<PlanListResponse> => {
  const response = await apiClient.get<PlanListResponse>('/plans/list');
  return response.data;
};

export const getPlanPosts = async (planId: string): Promise<PlanPostsResponse> => {
  const response = await apiClient.get<PlanPostsResponse>(`/plans/${planId}/posts`);
  return response.data;
};

export const getPlanDetail = async (planId: string): Promise<PlanDetail> => {
  const response = await apiClient.get<PlanDetail>(`/plans/${planId}`);
  return response.data;
};

export const getPlanPostsPaginated = async (
  planId: string,
  page: number = 1,
  perPage: number = 20
): Promise<PlanPostsPaginatedResponse> => {
  const response = await apiClient.get<PlanPostsPaginatedResponse>(
    `/plans/${planId}/posts-paginated`,
    { params: { page, per_page: perPage } }
  );
  return response.data;
};

export const updatePlan = async (planId: string, planData: PlanUpdateRequest): Promise<Plan> => {
  const response = await apiClient.put<Plan>(`/plans/${planId}`, planData);
  return response.data;
};

export const requestPlanDeletion = async (
  planId: string
): Promise<{ message: string; plan_id: string }> => {
  const response = await apiClient.post<{ message: string; plan_id: string }>(
    `/plans/${planId}/delete-request`
  );
  return response.data;
};

export const getPlanSubscribers = async (
  planId: string,
  page: number = 1,
  perPage: number = 20
): Promise<PlanSubscriberListResponse> => {
  const response = await apiClient.get<PlanSubscriberListResponse>(`/plans/${planId}/subscribers`, {
    params: { page, per_page: perPage },
  });
  return response.data;
};

export const getCreatorPostsForPlan = async (
  planId?: string
): Promise<CreatorPostsForPlanResponse> => {
  const response = await apiClient.get<CreatorPostsForPlanResponse>('/plans/posts/for-plan', {
    params: planId ? { plan_id: planId } : {},
  });
  return response.data;
};

export const reorderPlans = async (
  planOrders: PlanReorderRequest
): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>('/plans/reorder', planOrders);
  return response.data;
};
