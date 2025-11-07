// ユーザーロール定義（バックエンドのauth.py:89を参照）
export enum UserRole {
  USER = 1, // 一般ユーザー
  CREATOR = 2, // クリエイター
  ADMIN = 3, // 管理者
}

export const isUser = (role: number): boolean => role === UserRole.USER;
export const isCreator = (role: number): boolean => role === UserRole.CREATOR;
export const isAdmin = (role: number): boolean => role === UserRole.ADMIN;

export const getUserRoleText = (role: number): string => {
  switch (role) {
    case UserRole.USER:
      return 'ユーザー';
    case UserRole.CREATOR:
      return 'クリエイター';
    case UserRole.ADMIN:
      return '管理者';
    default:
      return '不明';
  }
};
