export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  followingCount: number;
  followerCount: number;
  totalLikes: number;
}

export interface TabItem {
  id: string;
  label: string;
  count: number;
  isActive: boolean;
}

export interface TabNavigationSectionProps {
  items: TabItem[];
  onItemClick: (itemId: string) => void;
}
