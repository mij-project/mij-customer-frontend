export interface PlanCreateRequest {
	name: string;
	description?: string;
	price: number;
	currency?: string;
	billing_cycle?: number;
}

export interface Plan {
	id: string;
	name: string;
	description?: string;
	price: number;
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
}

export interface PlanPostsPaginatedResponse {
	posts: PlanPost[];
	total: number;
	page: number;
	per_page: number;
	has_next: boolean;
}