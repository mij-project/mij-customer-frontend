export interface Post {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  creator: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    official: boolean;
  };
  rank?: number;
}

export interface RecentPostsSectionProps {
  posts: Post[];
}

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  cover?: string;
  followers: number;
  verified?: boolean;
  official?: boolean;
  rank?: number;
  likes?: number;
  is_following?: boolean;
  follower_ids?: string[];
}

export interface CreatorsSectionProps {
  title: string;
  creators: Creator[];
  showRank?: boolean;
  onCreatorClick?: (creatorId: string) => void;
  showMoreButton?: boolean;
  isSpecialShow?: boolean;
  scrollable?: boolean;
  followers?: number;
  onFollowClick?: (isFollowing: boolean, creatorId: string) => void;
  isShowFollowButton?: boolean;
  onShowMoreClick?: () => void;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  post_count: number;
}

export interface RecommendedGenresSectionProps {
  categories: Category[];
}

export interface BannerItem {
  id: string;
  image: string;
  title: string;
}

export interface BannerCarouselSectionProps {
  bannerItems: BannerItem[];
}
