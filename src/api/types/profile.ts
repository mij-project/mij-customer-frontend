export interface ProfilePost {
  id: string;
  post_type: 1 | 2; // 1: 動画, 2: 画像
  likes_count: number;
  description?: string;
  thumbnail_storage_key?: string;
  thumbnail_url?: string;
  video_duration?: number;
  price?: number; // 単品購入価格
  currency?: string; // 通貨
  created_at: string;
  is_reserved?: boolean;
}

export interface PlanPost {
  description: string;
  thumbnail_url: string;
}

export interface ProfilePlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  type?: number; // 1: 通常プラン, 2: おすすめプラン
  post_count?: number; // プランに紐づく投稿数
  plan_post?: PlanPost[]; // プランに紐づく投稿（サムネイルと説明）
}

export interface ProfilePurchase {
  id: string;
  likes_count: number;
  description?: string;
  thumbnail_url?: string;
  video_duration?: number;
  created_at: string;
  price?: number; // 単品購入の価格
  currency?: string; // 通貨（デフォルト: JPY）
  is_reserved?: boolean;
}

export interface ProfileGacha {
  id: string;
  amount: number;
  created_at: string;
}

export interface SocialLinks {
  tiktok?: string;
  tiktok_link?: string;
  twitter?: string;
  twitter_link?: string;
  youtube?: string;
  youtube_link?: string;
  instagram?: string;
  instagram_link?: string;
  website?: string;
  website2?: string;
}

export interface UserProfile {
  id: string;
  profile_name: string;
  offical_flg: boolean;
  username?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  website_url?: string;
  post_count: number;
  follower_count: number;
  posts: ProfilePost[];
  plans: ProfilePlan[];
  individual_purchases: ProfilePurchase[];
  links?: SocialLinks;
}
