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
}

export interface PlanPostsResponse {
	posts: PlanPost[];
}