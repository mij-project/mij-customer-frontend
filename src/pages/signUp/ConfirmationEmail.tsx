import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import AuthLayout from '@/features/auth/AuthLayout';
import AccountHeader from '@/features/account/components/AccountHeader';
import { resendVerificationEmail } from '@/api/endpoints/verifyEmail';
import { ErrorMessage } from '@/components/common';
import { VerifyEmailRequest } from '@/api/types/verifyEmail';

export default function ConfirmationEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | undefined>(undefined);
  useEffect(() => {
    // SignUpページから渡されたメールアドレスを取得
    const state = location.state as { email?: string; code?: string } | null;
    if (state?.email) {
      setEmail(state.email);
      setCode(state.code);
    } else {
      // メールアドレスがない場合はSignUpページに戻す
      navigate('/signup');
    }
  }, [location.state, navigate]);

  // クールダウンタイマー
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resending || resendCooldown > 0 || !email) return;

    setResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const send_data: VerifyEmailRequest = {
        email: email,
        code: code,
      };

      // TODO: エラーハンドリングの追加
      await resendVerificationEmail(send_data);
      setResendSuccess(true);
      setResendCooldown(60); // 60秒のクールダウン
    } catch (err: any) {
      console.error('Resend email error:', err);
      setError(err.response?.data?.message || 'メールの再送信に失敗しました');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <AccountHeader title="メール確認" />
      <AuthLayout>
        <div className="text-center space-y-6 pt-4">
          {/* アイコン */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* タイトル */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">メールをご確認ください</h2>
            <p className="text-gray-600">登録確認メールを送信しました</p>
          </div>

          {/* メールアドレス表示 */}
          {email && (
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">送信先:</p>
              <p className="text-base font-medium text-gray-900 break-all">{email}</p>
            </div>
          )}

          {/* 説明文 */}
          <div className="text-left space-y-3 bg-secondary rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                メール内のリンクをクリックして、登録を完了してください
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                メールが届かない場合は、迷惑メールフォルダをご確認ください
              </p>
            </div>
          </div>

          {/* 成功メッセージ */}
          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                確認メールを再送信しました。メールボックスをご確認ください。
              </p>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && <ErrorMessage message={error} variant="error" />}

          {/* 再送信ボタン */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={resending || resendCooldown > 0}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              {resending
                ? '送信中...'
                : resendCooldown > 0
                  ? `再送信 (${resendCooldown}秒後に可能)`
                  : 'メールを再送信'}
            </Button>

            {/* ログインページへのリンク */}
            <p className="text-sm text-gray-600">
              すでにメールを確認済みの方は
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:text-primary/80 ml-1 font-medium"
              >
                ログイン
              </button>
            </p>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
}
