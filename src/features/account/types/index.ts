import { LikedPost } from "@/api/types/account";


export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  followingCount: number;
  followerCount: number;
  totalLikes: number;
}

export interface AccountInfo {
  profile_info: {
    profile_name: string;
    username: string;
    avatar_url: string | null;
    cover_url: string | null;
  };
  social_info: {
    followers_count: number;
    following_count: number;
    total_likes: number;
    liked_posts: LikedPost[];
  };
  posts_info: {
    pending_posts_count: number;
    rejected_posts_count: number;
    unpublished_posts_count: number;
    deleted_posts_count: number;
    approved_posts_count: number;
  };
  sales_info: {
    total_sales: number;
  };
  plan_info: {
    plan_count: number;
    total_price: number;
    subscribed_plan_count: number;
    subscribed_total_price: number;
    subscribed_plan_details: any[];
    single_purchases_count: number;
    single_purchases_data: any[];
  };
}

export interface AccountHeaderProps {
  title: string;
  showBackButton?: boolean;
  showActions?: boolean;
}

export interface AccountLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  count?: number;
  isActive?: boolean;
}

export interface AccountNavigationProps {
  items: NavigationItem[];
  onItemClick: (id: string) => void;
}