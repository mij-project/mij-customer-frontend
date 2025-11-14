export interface CommentCreate {
  body: string;
  parent_comment_id?: string;
}

export interface CommentUpdate {
  body: string;
}

export interface CommentResponse {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  body: string;
  created_at: string;
  updated_at: string;
  user_username: string;
  user_avatar?: string;
}

export interface UserBasicResponse {
  id: string;
  username: string;
  profile_name: string;
  avatar_storage_key?: string;
}

export interface FollowStatsResponse {
  followers_count: number;
  following_count: number;
}

export interface SocialStatsResponse {
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  is_following: boolean;
}

export interface SocialActionResponse {
  liked?: boolean;
  bookmarked?: boolean;
  following?: boolean;
  message: string;
}

export interface PostSocialInfo {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  creator_user_id: string;
}
