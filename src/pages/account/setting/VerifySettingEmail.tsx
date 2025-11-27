import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyCheck } from '@/api/endpoints/verifyEmail';
import { setCsrfToken } from '@/api/axios';
import { me as meApi } from '@/api/endpoints/auth';
import { useAuth } from '@/providers/AuthContext';
import { settingEmailVerify } from '@/api/endpoints/account';

export default function SettingVerifyEmail() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState({ show: false, message: '' });
  const { reload } = useAuth();

  useEffect(() => {
    const verifySettingEmail = async () => {
      try {
        const res = await settingEmailVerify(token as string);
        if (res.status !== 200) {
          throw new Error('メールアドレスの確認に失敗しました');
        }
          navigate('/', { state: { emailVerified: true } });
      } catch (error) {
        if (error.response.status === 400) {
          alert('メールアドレス確認期限切れました。再度メールアドレスを設定してください。');
          navigate('/account/setting/email');
          return;
        }
        alert('メールアドレスの確認に失敗しました');
        navigate('/account/settings');
      }
    };
    verifySettingEmail();
  }, [token]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <h1 className="text-2xl font-bold">メールアドレスの確認中...</h1>
    </div>
  );
}
