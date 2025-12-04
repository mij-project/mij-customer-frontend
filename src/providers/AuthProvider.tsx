import React, { useEffect, useState } from 'react';
import { AuthCtx, AuthContextValue, User } from '@/providers/AuthContext';
import { me as meApi } from '@/api/endpoints/auth';
import { isUser, isCreator, isAdmin } from '@/utils/userRole';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const me = await meApi();
      if (me.status === 200 && me.data.status === '401') {
        setUser(null);
        localStorage.removeItem('lastAccessTime');
        return;
      }
      setUser(me.data as User);
      // アクセス成功時にローカルストレージに最終アクセス時刻を保存
      localStorage.setItem('lastAccessTime', Date.now().toString());
    } catch (error: any) {
      console.log('Auth reload error:', error);
      // 401エラーまたは48時間期限切れエラーをハンドル
      if (error?.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('lastAccessTime');
        // 401エラーの場合はリダイレクトしない（公開ページへのアクセスを許可）
        console.log('User not authenticated, allowing access to public pages');
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // 48時間チェック（クライアントサイド）
  const checkInactivity = () => {
    const lastAccessTime = localStorage.getItem('lastAccessTime');
    if (lastAccessTime) {
      const now = Date.now();
      const timeDiff = now - parseInt(lastAccessTime);
      const hoursSinceLastAccess = timeDiff / (1000 * 60 * 60);

      if (hoursSinceLastAccess > 48) {
        // 48時間経過している場合、ユーザーをログアウト
        setUser(null);
        localStorage.removeItem('lastAccessTime');
        // 48時間期限切れでもリダイレクトしない（公開ページへのアクセスを許可）
        return true;
      }
    }
    return false;
  };

  // 初期ロード
  useEffect(() => {
    let timeout = setTimeout(() => {
      // フェイルセーフ：何かあってもローディングを落とす
      setLoading(false);
    }, 5000);

    // まずクライアントサイドで48時間チェック
    if (!checkInactivity()) {
      // 期限切れでない場合のみサーバーに問い合わせ
      reload().finally(() => clearTimeout(timeout));
    } else {
      setLoading(false);
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, []);

  // 定期的な非アクティブチェック（10分間隔）
  useEffect(() => {
    const interval = setInterval(
      () => {
        checkInactivity();
      },
      10 * 60 * 1000
    ); // 10分間隔

    return () => clearInterval(interval);
  }, []);

  // ロール判定のヘルパー関数
  const roleHelpers = {
    isUser: () => (user ? isUser(user.role) : false),
    isCreator: () => (user ? isCreator(user.role) : false),
    isAdmin: () => (user ? isAdmin(user.role) : false),
  };

  const value: AuthContextValue = {
    user,
    loading,
    reload,
    setUser,
    ...roleHelpers,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
