import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyCheck } from '@/api/endpoints/verifyEmail';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await verifyCheck(token as string);
        if (res.result) {
          navigate('/login');
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
  }, [token]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <h1 className="text-2xl font-bold">メールアドレスの確認中...</h1>
    </div>
  );
}
