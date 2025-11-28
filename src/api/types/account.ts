import { AccountFileKind } from '@/constants/constants';
import { FileSpec } from './commons';

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

export interface ProfileEditInfo {
  profile_name: string;
  username: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  links: Record<string, string> | null;
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
  // reserved_posts_count: number;
}

export interface SalesInfo {
  total_sales: number;
}

export interface SubscribedPlanDetail {
  purchase_id: string;
  plan_id: string;
  plan_name: string;
  plan_description: string | null;
  price: number;
  purchase_created_at: string;
  creator_avatar_url: string | null;
  creator_username: string | null;
  creator_profile_name: string | null;
  post_count: number;
  thumbnail_keys: string[];
}

export interface PlanInfo {
  plan_count: number;
  total_price: number;
  subscribed_plan_count: number;
  subscribed_total_price: number;
  subscribed_plan_details: SubscribedPlanDetail[];
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
  id: string;
  description: string;
  thumbnail_url: string | null;
  likes_count: number;
  comments_count: number;
  purchase_count: number;
  creator_name: string;
  username: string;
  creator_avatar_url: string | null;
  price: number | null;
  currency: string | null;
  created_at: string | null;
  duration: string | null;
  is_video: boolean;
}

export interface AccountPostStatusResponse {
  pending_posts: AccountPostResponse[];
  rejected_posts: AccountPostResponse[];
  unpublished_posts: AccountPostResponse[];
  deleted_posts: AccountPostResponse[];
  approved_posts: AccountPostResponse[];
  reserved_posts: AccountPostResponse[];
}

export interface AccountMediaAsset {
  kind: number;
  storage_key: string | null;
  status: number;
  reject_comments: string | null;
  sample_type: 'upload' | 'cut_out';
  sample_start_time: number;
  sample_end_time: number;
  duration_sec: number;
}

export interface AccountPostDetailResponse {
  id: string;
  description: string;
  reject_comments: string | null;
  likes_count: number;
  comments_count: number;
  purchase_count: number;
  creator_name: string;
  username: string;
  creator_avatar_url: string | null;
  price: number;
  currency: string;
  scheduled_at: string | null;
  expiration_at: string | null;
  duration: string | null;
  is_video: boolean;
  post_type: number | null; // 1=VIDEO, 2=IMAGE
  status: number;
  visibility: number;
  // メディア情報
  media_assets: Record<string, AccountMediaAsset>;
  // カテゴリー・プラン情報
  category_ids: string[];
  tags: string | null;
  plan_list: {
    id: string;
    name: string;
  }[];
}

export interface AccountPostUpdateRequest {
  description?: string;
  status?: number;
  visibility?: number;
}

export interface AccountPostUpdateResponse {
  message: string;
  success: boolean;
}

// 画像申請関連
export interface ProfileImageSubmission {
  id: string;
  user_id: string;
  image_type: number; // 1=avatar, 2=cover
  storage_key: string;
  status: number; // 1=pending, 2=approved, 3=rejected
  approved_by: string | null;
  checked_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileImageSubmissionRequest {
  image_type: number; // 1=avatar, 2=cover
  storage_key: string;
}

export interface ProfileImageStatusResponse {
  avatar_submission: ProfileImageSubmission | null;
  cover_submission: ProfileImageSubmission | null;
}
