import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyCheck } from '@/api/endpoints/verifyEmail';
import { setCsrfToken } from '@/api/axios';
import { me as meApi } from '@/api/endpoints/auth';
import { useAuth } from '@/providers/AuthContext';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');
  const code = searchParams.get('code');
  const { reload } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await verifyCheck(token as string, code || undefined);
        if (res.result) {
          const csrf = (res.data as any)?.csrf_token ?? null;
          setCsrfToken(csrf);

          // 3) /auth/me でユーザー情報を取得（Cookieベース）
          await meApi();
    
          // 4) AuthProviderの状態を更新
          await reload();

          // 5) メール認証完了フラグとともにTopページへ遷移
          navigate('/', { state: { emailVerified: true } });
        } else {
          alert('メールアドレスの確認に失敗しました');
          navigate('/signup');
        }
      } catch (error) {
        console.error(error);
        alert('メールアドレスの確認に失敗しました');
      }
    };
    verifyEmail();
  }, [token, code]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <h1 className="text-2xl font-bold">メールアドレスの確認中...</h1>
    </div>
  );
}
