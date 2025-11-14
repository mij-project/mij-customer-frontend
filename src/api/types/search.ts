export interface CreatorSearchResult {
  id: string;
  profile_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
  is_verified: boolean;
  posts_count: number;
}

export interface PostCreatorInfo {
  id: string;
  profile_name: string;
  username: string;
  avatar_url: string | null;
}

export interface PostSearchResult {
  id: string;
  description: string | null;
  post_type: number; // 1=VIDEO, 2=IMAGE
  thumbnail_key: string | null;
  visibility: number;
  likes_count: number;
  creator: PostCreatorInfo;
  created_at: string;
}

export interface HashtagSearchResult {
  id: string;
  name: string;
  slug: string;
  posts_count: number;
}

export interface SearchSectionResponse<T> {
  total: number;
  items: T[];
  has_more: boolean;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  creators?: SearchSectionResponse<CreatorSearchResult>;
  posts?: SearchSectionResponse<PostSearchResult>;
  hashtags?: SearchSectionResponse<HashtagSearchResult>;
  search_history_saved: boolean;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  search_type: string | null;
  filters: object | null;
  created_at: string;
}

export interface SearchHistoryResponse {
  items: SearchHistoryItem[];
}

export interface SearchParams {
  query: string;
  type?: 'all' | 'users' | 'posts' | 'hashtags';
  sort?: 'relevance' | 'popularity';
  category_ids?: string[];
  post_type?: 1 | 2;
  page?: number;
  per_page?: number;
}
