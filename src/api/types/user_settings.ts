export enum UserSettingsType {
  email = 1,
}

export type UserSettings = {
  id: string;
  type: UserSettingsType;
  settings?: {};
  created_at: string;
  updated_at: string;
};
