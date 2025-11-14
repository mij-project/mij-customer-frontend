import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import AuthLayout from '@/features/auth/AuthLayout';
import AccountHeader from '@/features/account/components/AccountHeader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorMessage } from '@/components/common';
import InputComplete from '@/components/common/InputComplete';

interface PasswordForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const [formData, setFormData] = useState<PasswordForm>({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    navigate('/account/settings');
  };

  useEffect(() => {
    // URLからaccess_tokenとrefresh_tokenを取得してSupabaseセッションを設定
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    // if (!accessToken || !refreshToken) {
    //   setError('無効なリセットリンクです。パスワードリセットを再度お試しください。');
    // }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return false;
    }
    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(true);
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
              <h2 className="text-lg font-semibold text-gray-900 mb-2">パスワードを更新しました</h2>
              <p className="text-sm text-gray-600">新しいパスワードでログインしてください。</p>
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
      <AccountHeader title="新しいパスワード設定" />
      <AuthLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">新しいパスワードを設定</h2>
            <p className="text-sm text-gray-600">新しいパスワードを入力してください。</p>
          </div>

          {error && <ErrorMessage message={error} variant="error" onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                新しいパスワード（6文字以上）
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="新しいパスワードを入力"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pr-10"
                  required
                  disabled={submitting}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                  disabled={submitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                パスワード（確認）
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="パスワードを再入力"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pr-10"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                  disabled={submitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {submitting ? '更新中…' : 'パスワードを更新'}
            </Button>
          </form>
        </div>
      </AuthLayout>
      <InputComplete isOpen={isOpen} onClose={handleClose} />
    </div>
  );
}
