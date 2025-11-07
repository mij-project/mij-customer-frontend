// src/routes/PrivateRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, reload } = useAuth();

  const location = useLocation();

  // クライアントサイドでの48時間チェック
  useEffect(() => {
    const checkSessionValidity = () => {
      const lastAccessTime = localStorage.getItem('lastAccessTime');
      if (lastAccessTime) {
        const now = Date.now();
        const timeDiff = now - parseInt(lastAccessTime);
        const hoursSinceLastAccess = timeDiff / (1000 * 60 * 60);

        if (hoursSinceLastAccess > 48) {
          // 48時間経過している場合、セッションを無効化
          localStorage.removeItem('lastAccessTime');
          return false;
        }
      }
      return true;
    };

    if (user && !checkSessionValidity()) {
      console.log('セッション無効');
      reload();
    }
  }, [user, reload]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // 元の遷移先を state に保持
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
