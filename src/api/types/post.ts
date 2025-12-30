export interface CreatePostRequest {
  description: string;
  category_ids: string[];
  tags?: string;
  scheduled: boolean;
  formattedScheduledDateTime?: Date;
  expiration: boolean;
  expirationDate?: Date;
  plan: boolean;
  plan_ids?: string[];
  single: boolean;
  price?: number;
  post_type: 'video' | 'image';
}

export interface UpdatePostRequest {
  post_id: string;
  description: string;
  category_ids: string[];
  tags?: string;
  scheduled: boolean;
  formattedScheduledDateTime?: Date;
  expiration: boolean;
  expirationDate?: Date;
  plan: boolean;
  plan_ids?: string[];
  single: boolean;
  price?: number;
  post_type: 'video' | 'image';
  status?: number;
}

export interface MediaInfo {
  kind: number;
  duration: number | null;
  media_assets_id: string;
  orientation: 1 | 2; // 1=縦長(Portrait)、2=横長(Landscape)
  post_id: string;
  storage_key: string;
}

export interface PlanPost {
  description: string;
  thumbnail_url: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  type?: number; // 1=通常, 2=おすすめ
  open_dm_flg?: boolean;
  post_count?: number;
  plan_post?: PlanPost[];
  is_time_sale_active: boolean;
  time_sale_price: number;
  sale_percentage: number;
  end_date: string;
}

export interface PostDetailData {
  id: string;
  post_type: 1 | 2; // 1=動画、2=画像
  description: string;
  thumbnail_key: string;
  creator: {
    user_id?: string;
    username: string;
    profile_name: string;
    avatar: string;
    official: boolean;
  };
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  media_info: MediaInfo[];
  sale_info: {
    price: {
      id: string;
      price: number;
      is_time_sale_active: boolean;
      time_sale_price: number;
      sale_percentage: number;
      end_date: string;
    } | null;
    plans: Plan[];
  };
  post_main_duration: number;
  is_purchased: boolean; // 購入済み or 自分の投稿
  is_scheduled: boolean; // 予約投稿
  is_expired: boolean; // 期限切れ
}

export interface PostsByCategoryResponse {
  posts: {
    id: string;
    post_type: number;
    description: string;
    thumbnail_url: string;
    likes_count: number;
    views_count?: number;
    duration: string;
    creator_name: string;
    username: string;
    creator_avatar_url: string;
    category_name: string;
    official: boolean;
  }[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_previous: boolean;
  category_name: string;
}

export interface NewArrivalsPost {
  id: string;
  description: string;
  thumbnail_url: string | null;
  creator_name: string;
  username: string;
  creator_avatar_url: string | null;
  duration: string | null;
  likes_count: number;
  is_time_sale?: boolean;
}

export interface PaginatedNewArrivalsResponse {
  posts: NewArrivalsPost[];
  page: number;
  per_page: number;
  has_next: boolean;
  has_previous: boolean;
}
