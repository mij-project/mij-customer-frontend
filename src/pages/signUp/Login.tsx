// src/pages/Login.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '@/features/auth/AuthLayout';
import AccountHeader from '@/features/account/components/AccountHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { FaXTwitter } from 'react-icons/fa6';

// ★ 追加：API呼び出しとCSRFセット関数をインポート
import { login as loginApi, me as meApi, xAuth as xAuthApi } from '@/api/endpoints/auth';
import { setCsrfToken } from '@/api/axios'; // ← 先ほど修正した axios クライアントから

import type { LoginForm } from '@/api/types/auth';
import { loginSchema } from '@/utils/validationSchema';
import { ErrorMessage } from '@/components/common';

export default function Login() {
  const [formData, setFormData] = useState<LoginForm>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ show: false, messages: [] as string[] });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { reload } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const isValid = loginSchema.safeParse(formData);
    if (!isValid.success) {
      setErrors({ show: true, messages: isValid.error.issues.map((error) => error.message) });
      setSubmitting(false);
      return;
    }
    try {
      // 1) /auth/login（Cookieにaccess/refresh、bodyでcsrf_token）
      const res = await loginApi(formData);
      const csrf = (res.data as any)?.csrf_token ?? null;
      setCsrfToken(csrf);

      // 3) /auth/me でユーザー情報を取得（Cookieベース）
      await meApi();

      // 4) AuthProviderの状態を更新
      await reload();

      // 5) 成功 → 遷移
      navigate('/');
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? 'ログイン失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleXLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/x/login`;
  };

  return (
    <div className="bg-white">
      <AccountHeader title="ログイン" />
      <AuthLayout>
        <div className="space-y-6">
          {errors.show && <ErrorMessage message={errors.messages} variant="error" />}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                メールアドレス
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="入力する"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                パスワード
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="入力する"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? (
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
              {submitting ? '送信中…' : 'ログイン'}
            </Button>
          </form>

          <Button
            onClick={handleXLogin}
            className="w-full bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-2"
          >
            <FaXTwitter className="w-5 h-5" />
            でログイン
          </Button>

          <div className="text-center space-y-2">
            <a onClick={() => navigate('/auth/forgot-password')} className="text-sm text-primary hover:text-primary/80">
              パスワードを忘れた方はこちら
            </a>
          </div>

          <div className="text-center border-t border-gray-200 pt-4 space-y-2">
            <Button
              onClick={() => navigate('/signup')}
              className="w-full bg-white border border-primary hover:bg-primary/90 text-primary"
            >
              新規登録
            </Button>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
}
