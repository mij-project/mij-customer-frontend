import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { LoadingSpinner } from '@/components/common';

export default function XAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { reload } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // バックエンドがCookieを設定してリダイレクトしてくるので、
        // AuthContextを更新してホームに遷移
        await reload();

        // 新規ユーザーの場合はWelcomeモーダルを表示するためstateを渡す
        const isNewUser = searchParams.get('is_new_user') === 'true';
        navigate('/', {
          replace: true,
          state: isNewUser ? { isNewUser: true, authType: 'x' } : {},
        });
      } catch (error) {
        console.error('X認証コールバック処理エラー:', error);
        alert('X認証に失敗しました');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [reload, navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-gray-600">Xログイン認証中...</p>
      </div>
    </div>
  );
}
