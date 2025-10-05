import { AccountFileKind } from "@/constants/constants";
import { FileSpec } from "./commons";

export interface LikedPost {
  id: string;
  description: string;
  creator_user_id: string;
  profile_name: string;
  username: string;
  avatar_url: string;
  thumbnail_key: string;
  duration_sec: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInfo {
  profile_name: string;
  username: string;
  avatar_url: string | null;
  cover_url: string | null;
}

export interface SocialInfo {
  followers_count: number;
  following_count: number;
  total_likes: number;
  liked_posts: LikedPost[];
}

export interface PostsInfo {
  pending_posts_count: number;
  rejected_posts_count: number;
  unpublished_posts_count: number;
  deleted_posts_count: number;
  approved_posts_count: number;
}

export interface SalesInfo {
  total_sales: number;
}

export interface PlanInfo {
  plan_count: number;
  total_price: number;
  subscribed_plan_count: number;
  subscribed_total_price: number;
  subscribed_plan_details: any[];
  single_purchases_count: number;
  single_purchases_data: any[];
}

export interface AccountInfo {
  profile_info: ProfileInfo;
  social_info: SocialInfo;
  posts_info: PostsInfo;
  sales_info: SalesInfo;
  plan_info: PlanInfo;
}

export interface AccountUpdateRequest {
	name?: string;
	username?: string;
	description?: string;
	links?: Record<string, string>;
	avatar_url?: string;
	cover_url?: string;
}
  
export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  followingCount: number;
  followerCount: number;
  totalLikes: number;
}

export interface ProfileData {
	coverImage: string;
	avatar: string;
	name: string;
	id: string;
	description: string;
	links: Record<string, string>;
}

export interface AccountUploadedFile {
  id: string;
  name: string;
  type: AccountFileKind;
  uploaded: boolean;
}

export interface PresignedUrlFileSpec {
  kind: AccountFileKind;
  content_type: FileSpec['content_type'];
  ext: FileSpec['ext'];
}

export interface AccountPresignedUrlRequest {
  files: PresignedUrlFileSpec[];
}

export interface AccountPresignedUrlResponse {
  uploads: {
    [K in AccountFileKind]: {
      key: string;
      upload_url: string;
      required_headers: Record<string, string>;
      expires_in: number;
    };
  };
}

export interface AccountPostResponse {
    id: string
    description: string
    thumbnail_url: string | null
    likes_count: number
    creator_name: string
    username: string
    creator_avatar_url: string | null
	price: number | null
	currency: string | null
}

export interface AccountPostStatusResponse {
    pending_posts: AccountPostResponse[]
    rejected_posts: AccountPostResponse[]
    unpublished_posts: AccountPostResponse[]
    deleted_posts: AccountPostResponse[]
    approved_posts: AccountPostResponse[]
}
