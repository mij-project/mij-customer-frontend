import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';

export default function XAuthCallback() {
  const navigate = useNavigate();
  const { reload } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // バックエンドがCookieを設定してリダイレクトしてくるので、
        // AuthContextを更新してホームに遷移
        await reload();
        navigate('/', { replace: true });
      } catch (error) {
        console.error('X認証コールバック処理エラー:', error);
        alert('X認証に失敗しました');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [reload, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">ログイン処理中...</p>
      </div>
    </div>
  );
}
