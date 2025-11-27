import apiClient from '../axios';
import { UserSettings, UserSettingsType } from '../types/user_settings';

export const getUserSettings = async (type: UserSettingsType) => {
  const response = await apiClient.get(`/user-settings?type=${type}`);
  return response;
};

export const updateUserSettings = async (
  type: UserSettingsType,
  settings: Record<string, boolean>
) => {
  const response = await apiClient.patch(`/user-settings/${type}`, settings);
  return response;
};
