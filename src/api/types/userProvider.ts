export interface UserProvider {
  id: string;
  user_id: string;
  provider_id: string;
  sendid: string | null;
  cardbrand: string | null;
  cardnumber: string | null;
  yuko: string | null;
  is_valid: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export type UserProviderListResponse = UserProvider[];
