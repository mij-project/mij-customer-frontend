export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  postCount: number;
  followerCount: number;
  websiteUrl?: string;
  isFollowing: boolean;
  backgroundImage: string;
}

export interface GachaItem {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  remaining: number;
  total: number;
}

export interface IndividualPurchase {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  duration?: string;
  date: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  thumbnails: string[];
  postCount: number;
  monthlyPrice: number;
  isRecommended?: boolean;
  isFree?: boolean;
}

export interface Post {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  duration: string;
  date: string;
  isVideo?: boolean;
}

export interface Tab {
  id: string;
  label: string;
  count: number;
}
