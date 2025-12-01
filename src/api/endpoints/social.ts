// src/api/endpoints/social.ts
import apiClient from '@/api/axios';
import {
  CommentCreate,
  CommentUpdate,
  CommentResponse,
  UserBasicResponse,
  FollowStatsResponse,
  SocialActionResponse,
  PostSocialInfo,
} from '@/api/types/social';

// フォロー関連API
export const toggleFollow = (userId: string) =>
  apiClient.post<SocialActionResponse>(`/social/follow/${userId}`);

export const getFollowStatus = (userId: string) =>
  apiClient.get<{ following: boolean }>(`/social/follow/status/${userId}`);

export const getFollowers = (userId: string, skip = 0, limit = 20) =>
  apiClient.get<UserBasicResponse[]>(`/social/followers/${userId}?skip=${skip}&limit=${limit}`);

export const getFollowing = (userId: string, skip = 0, limit = 20) =>
  apiClient.get<UserBasicResponse[]>(`/social/following/${userId}?skip=${skip}&limit=${limit}`);

// いいね関連API
export const toggleLike = (postId: string) =>
  apiClient.post<SocialActionResponse>(`/social/like/${postId}`);

export const getLikeStatus = (postId: string) =>
  apiClient.get<{ liked: boolean; likes_count: number }>(`/social/like/status/${postId}`);

export const getLikesStatusBulk = (postIds: string[]) =>
  apiClient.post<Record<string, { liked: boolean; likes_count: number }>>(
    `/social/like/status/bulk`,
    postIds
  );

export const getLikedPosts = (skip = 0, limit = 20) =>
  apiClient.get<PostSocialInfo[]>(`/social/liked-posts?skip=${skip}&limit=${limit}`);

// コメント関連API
export const createComment = (postId: string, comment: CommentCreate) =>
  apiClient.post<CommentResponse>(`/social/comments/${postId}`, comment);

export const getComments = (postId: string, skip = 0, limit = 50) =>
  apiClient.get<CommentResponse[]>(`/social/comments/${postId}?skip=${skip}&limit=${limit}`);

export const getCommentReplies = (parentCommentId: string, skip = 0, limit = 20) =>
  apiClient.get<CommentResponse[]>(
    `/social/comments/${parentCommentId}/replies?skip=${skip}&limit=${limit}`
  );

export const updateComment = (commentId: string, comment: CommentUpdate) =>
  apiClient.put<CommentResponse>(`/social/comments/${commentId}`, comment);

export const deleteComment = (commentId: string) =>
  apiClient.delete<{ message: string }>(`/social/comments/${commentId}`);

// ブックマーク関連API
export const toggleBookmark = (postId: string) =>
  apiClient.post<SocialActionResponse>(`/social/bookmark/${postId}`);

export const getBookmarkStatus = (postId: string) =>
  apiClient.get<{ bookmarked: boolean }>(`/social/bookmark/status/${postId}`);

export const getBookmarksStatusBulk = (postIds: string[]) =>
  apiClient.post<Record<string, { bookmarked: boolean }>>(
    `/social/bookmark/status/bulk`,
    postIds
  );

export const getBookmarks = (skip = 0, limit = 20) =>
  apiClient.get<PostSocialInfo[]>(`/social/bookmarks?skip=${skip}&limit=${limit}`);
