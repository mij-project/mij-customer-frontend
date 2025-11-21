import React, { useState } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SendComplete from '@/components/common/SendComplete';
import { useNavigate } from 'react-router-dom';
import { accountSettingEmailSchema } from '@/utils/validationSchema';
import { ErrorMessage } from '@/components/common';
import { settingEmail } from '@/api/endpoints/account';

export default function Email() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState({ show: false, messages: [] });

  const handleSettingEmail = async (email: string) => {
    try {
      setError({ show: false, messages: [] });
      const res = await settingEmail(email);
      if (res.status !== 200) {
        throw new Error('メールアドレスの変更に失敗しました');
      }
      setIsOpen(true);
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        setError({ show: true, messages: ['メールアドレスがすでに使用されています'] });
        return;
      }
      setError({ show: true, messages: ['メールアドレスの設定失敗しました'] });
    }
  }
  const handleSubmit = () => {
    const isValid = accountSettingEmailSchema.safeParse({ email });
    if (!isValid.success) {
      setError({ show: true, messages: isValid.error.issues.map((error) => error.message) });
      return;
    }
    // メール送信処理をここに追加
    handleSettingEmail(email);
  };

  const handleClose = () => {
    setIsOpen(false);
    navigate('/account/settings');
  };

  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader
        title="メールアドレス変更"
        showBackButton={true}
        onBack={() => navigate('/account/settings')}
      />
      <div className="p-6 space-y-6 mt-16">
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">メールアドレスの変更</h2>
          <p className="text-sm text-gray-600">
            変更したいメールアドレスを入力してください。そのメールアドレスに認証リンクを送ります。
            <br />
            mijfansからのメールが迷惑メールに振り分けられている可能性があります。
          </p>
        </div>
        <div className="space-y-4 w-full">
          {error.show && <ErrorMessage message={error.messages} variant="error" />}
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            メールアドレス
          </Label>

          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError({ show: false, messages: [] });
            }}
            className="mt-4 w-full"
          />
          <Button className="mt-4" onClick={handleSubmit}>
            送信
          </Button>
        </div>
      </div>
      <SendComplete isOpen={isOpen} onClose={handleClose} for_address={email} send_type="email" />
    </div>
  );
}
