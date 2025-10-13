import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6"; 
import AuthLayout from '@/features/auth/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { SignUpForm } from '@/api/types/user';
import { signUp } from '@/api/endpoints/user';

export default function SingUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpForm>({
    email: '',
    password: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Sign up form submitted:', formData);

    try {
      const response = await signUp(formData);
      console.log('Sign up response:', response);
      navigate('/login');
    } catch (error) {
      console.error('Sign up error:', error);
      alert('登録に失敗しました');
    }
  };

  const handleTwitterSignUp = () => {
    console.log('Twitter sign up clicked');
  };

  const isFormValid = formData.email  && formData.password;

  return (
    <AuthLayout title="新規登録">
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
            アカウントを作成
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
  );
}
