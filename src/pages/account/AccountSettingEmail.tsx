import React, { useState } from 'react';
import AccountHeader from '@/features/account/component/AccountHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
export default function AccountSettingEmail() {
  const [email, setEmail] = useState('');
  return (
    <div className="bg-white">
      <AccountHeader title="メールアドレス変更" showBackButton={false} />
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

        <Label htmlFor="email" className="text-sm font-medium text-gray-700">メールアドレス</Label>

          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-4 w-full"
          />
          <Button className="mt-4">保存</Button>
        </div>
      </div>
    </div>
  );
}