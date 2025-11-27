import { Creator } from '@/features/top/types';

export interface CreatorGenreCreate {
  gender_slug: string[];
}

export interface CreatorUpdate {
  name?: string;
  first_name_kana?: string;
  last_name_kana?: string;
  address?: string;
  phone_number?: string;
  birth_date?: string;
  category_id?: string;
  country_code?: string;
}

export interface CreatorOut {
  user_id: string;
  name?: string;
  first_name_kana?: string;
  last_name_kana?: string;
  address?: string;
  phone_number?: string;
  birth_date?: string;
  status: number;
  category_id?: string;
  country_code?: string;
  tos_accepted_at?: string;
  created_at: string;
}

export interface IdentityVerificationCreate {
  user_id: string;
}

export interface IdentityVerificationOut {
  id: string;
  user_id: string;
  status: number;
  checked_at?: string;
  notes?: string;
}

export interface IdentityDocumentCreate {
  verification_id: string;
  kind: number;
  storage_key: string;
}

export interface IdentityDocumentOut {
  id: string;
  verification_id: string;
  kind: number;
  storage_key: string;
  created_at: string;
}

export interface RankingCreator {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  cover?: string;
  followers: number;
  follower_ids: string[];
  rank?: number;
  likes?: number;
}

export interface RankingCreators {
  daily: RankingCreator[];
  weekly: RankingCreator[];
  monthly: RankingCreator[];
  all_time: RankingCreator[];
}

export interface RankingCreatorCategories {
  category_id: string;
  category_name: string;
  creators: RankingCreator[];
}

export interface RankingCreatorsCategories {
  daily: RankingCreatorCategories[];
  weekly: RankingCreatorCategories[];
  monthly: RankingCreatorCategories[];
  all_time: RankingCreatorCategories[];
}
