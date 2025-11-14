export interface Post {
  id: string;
  description: string;
  thumbnail_url: string;
  likes_count: number;
  creator_name: string;
  username: string;
  creator_avatar_url: string;
  rank: number;
}

export interface RankingSection {
  id: string;
  title: string;
  posts: Post[];
}

export interface TabItem {
  id: string;
  label: string;
  isActive: boolean;
  linkTo?: string;
}

export interface RankingPostsAllTimeResponse {
  id: string;
  description: string;
  thumbnail_url: string;
  likes_count: number;
  creator_name: string;
  username: string;
  creator_avatar_url: string;
  rank: number;
}

export interface RankingPostsDailyResponse {
  id: string;
  description: string;
  thumbnail_url: string;
  likes_count: number;
  creator_name: string;
  username: string;
  creator_avatar_url: string;
  rank: number;
}

export interface RankingPostsMonthlyResponse {
  id: string;
  description: string;
  thumbnail_url: string;
  likes_count: number;
  creator_name: string;
  username: string;
  creator_avatar_url: string;
  rank: number;
}

export interface RankingPostsWeeklyResponse {
  id: string;
  description: string;
  thumbnail_url: string;
  likes_count: number;
  creator_name: string;
  username: string;
  creator_avatar_url: string;
  rank: number;
}

export interface RankingOverallResponse {
  all_time: RankingPostsAllTimeResponse[];
  monthly: RankingPostsMonthlyResponse[];
  weekly: RankingPostsWeeklyResponse[];
  daily: RankingPostsDailyResponse[];
}

export interface RankingPostsGenresDailyResponse {
  id: string;
  description: string;
  thumbnail_url: string;
  likes_count: number;
  creator_name: string;
  username: string;
  creator_avatar_url: string;
  rank: number;
}

export interface RankingPostsGenresResponse {
  genre_id: string;
  genre_name: string;
  posts: RankingPostsGenresDailyResponse[];
}

export interface RankingGenresResponse {
  all_time: RankingPostsGenresResponse[];
  monthly: RankingPostsGenresResponse[];
  weekly: RankingPostsGenresResponse[];
  daily: RankingPostsGenresResponse[];
}
