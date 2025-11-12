import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import AuthLayout from '@/features/auth/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { SignUpForm } from '@/api/types/user';
import { signUpCompany } from '@/api/endpoints/user';
import { ErrorMessage } from '@/components/common';
import { signUpSchema } from '@/utils/validationSchema';
import AccountHeader from '@/features/account/components/AccountHeader';

export default function SingUp() {
  const navigate = useNavigate();
  const { company_code } = useParams<{ company_code: string }>();
  const [formData, setFormData] = useState<SignUpForm>({
    email: '',
    password: '',
    name: '',
    company_code: company_code || null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ show: false, messages: [] as string[] });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrors({ show: false, messages: [] });
    try {
      const isValid = signUpSchema.safeParse(formData);
      if (!isValid.success) {
        setErrors({ show: true, messages: isValid.error.issues.map((error) => error.message) });
        setSubmitting(false);
        return;
      }
      const response = await signUpCompany(formData);
      navigate('/login');
      setSubmitting(false);
    } catch (error) {
      console.error(error);
      setErrors({ show: true, messages: ['登録に失敗しました'] });
      setSubmitting(false);
    }
  };

  const handleTwitterSignUp = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/x/login`;
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className="bg-white">
      <AccountHeader title="新規登録" />
      <AuthLayout title="新規登録">
        {errors.show && <ErrorMessage message={errors.messages} variant="error" />}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                メールアドレス
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
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
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
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
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                名前
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={!isFormValid}
              className="w-full bg-primary hover:bg-primary/90 text-white disabled:bg-gray-300"
            >
              {submitting ? '送信中...' : 'アカウントを作成'}
              {/* アカウントを作成 */}
            </Button>
          </form>

          <div className="text-center">
            <span className="text-gray-500">or</span>
          </div>

          <Button
            onClick={handleTwitterSignUp}
            className="w-full bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-2"
          >
            <FaXTwitter className="w-5 h-5" />
            で登録
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              すでにアカウントをお持ちですか？{' '}
              <a href="/login" className="text-primary hover:text-primary/80">
                ログイン
              </a>
            </span>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
}
