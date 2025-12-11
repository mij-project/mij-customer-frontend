export interface PlanCreateRequest {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  billing_cycle?: number;
  type?: number; // 1=通常, 2=おすすめ
  welcome_message?: string;
  post_ids?: string[];
}

export interface PlanUpdateRequest {
  name?: string;
  description?: string;
  type?: number;
  welcome_message?: string;
  post_ids?: string[];
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  type?: number;
  display_order?: number | null;
  welcome_message?: string | null;
  post_count?: number;
  subscriber_count?: number;
  plan_status?: number;
}

export interface PlanListResponse {
  plans: Plan[];
}

export interface PlanPost {
  id: string;
  thumbnail_url: string | null;
  title: string;
  creator_avatar: string | null;
  creator_name: string;
  creator_username: string;
  likes_count: number;
  comments_count: number;
  duration?: string;
  is_video: boolean;
  created_at: string;
  price?: number | null;
  currency?: string | null;
}

export interface PlanPostsResponse {
  posts: PlanPost[];
}

export interface PlanDetail {
  id: string;
  name: string;
  description?: string;
  price: number;
  creator_id: string;
  creator_name: string;
  creator_username: string;
  creator_avatar_url?: string;
  creator_cover_url?: string;
  post_count: number;
  is_subscribed: boolean;
  type?: number;
  subscriptions_count: number;
}

export interface PlanPostsPaginatedResponse {
  posts: PlanPost[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface PlanSubscriber {
  user_id: string;
  username: string;
  profile_name: string;
  avatar_url: string | null;
  subscribed_at: string;
  current_period_end: string;
}

export interface PlanSubscriberListResponse {
  subscribers: PlanSubscriber[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface CreatorPost {
  id: string;
  thumbnail_url: string | null;
  title: string;
  duration?: string | null;
  is_video: boolean;
  created_at: string;
  is_included: boolean;
}

export interface CreatorPostsForPlanResponse {
  posts: CreatorPost[];
}

export interface PlanReorderRequestItem {
  plan_id: string;
  display_order: number;
}

export interface PlanReorderRequest {
  plan_orders: Array<PlanReorderRequestItem>;
}
