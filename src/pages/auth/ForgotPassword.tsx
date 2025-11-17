import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/features/auth/AuthLayout';
import AccountHeader from '@/features/account/components/AccountHeader';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage } from '@/components/common';
import { requestPasswordReset } from '@/api/endpoints/passwordReset';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('[ForgotPassword] Error:', err);
      const errorMessage =
        err?.response?.data?.detail || 'パスワードリセットメールの送信に失敗しました。しばらくしてから再度お試しください。';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white">
        <AccountHeader title="パスワードリセット" />
        <AuthLayout>
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">メールを送信しました</h2>
              <p className="text-sm text-gray-600 mb-4">
                パスワードリセットの手順をメールで送信しました。
              </p>
              <p className="text-sm text-gray-600">
                メールに記載されたリンクをクリックして、新しいパスワードを設定してください。
              </p>
            </div>
            <Button
              onClick={() => navigate('/auth/login')}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              ログインページへ
            </Button>
          </div>
        </AuthLayout>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AccountHeader title="パスワードリセット" />
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">パスワードをお忘れですか？</h2>
            <p className="text-sm text-gray-600">
              登録されているメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
            </p>
          </div>

          {error && <ErrorMessage message={error} variant="error" onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                メールアドレス
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className="mt-1"
                required
                disabled={submitting}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {submitting ? '送信中…' : 'リセットメールを送信'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/login')}
              className="w-full text-gray-600 hover:text-gray-900"
              disabled={submitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ログインページに戻る
            </Button>
          </form>
        </div>
      </AuthLayout>
    </div>
  );
}
