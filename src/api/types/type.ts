export interface TopPageData {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    post_count: number;
  }>;
  ranking_posts: Array<{
    id: string;
    post_type: number;
    title: string;
    thumbnail?: string;
    likes?: number;
    creator: {
      name: string;
      username: string;
      avatar_url?: string;
      verified: boolean;
    };
    rank?: number;
    duration?: string;
  }>;
  top_creators: Array<{
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    followers: number;
    rank?: number;
    follower_ids?: Array<string>;
    likes?: number;
  }>;
  new_creators: Array<{
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    followers: number;
  }>;
  recent_posts: Array<{
    id: string;
    post_type: number;
    title: string;
    thumbnail?: string;
    creator: {
      name: string;
      username: string;
      avatar_url?: string;
      verified: boolean;
    };
    duration?: string;
    likes?: number;
    rank?: number;
  }>;
}
