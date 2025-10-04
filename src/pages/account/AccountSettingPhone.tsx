import AccountHeader from '@/features/account/component/AccountHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
export default function AccountSettingPhone() {
  const [phone, setPhone] = useState('');
  return (
    <div className="bg-white">
      <AccountHeader title="電話番号認証" showBackButton={false} />
      <div className="p-6 space-y-6 mt-16">
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">電話番号の認証</h2>
          <p className="text-sm text-gray-600">
            お手持ちの認証コードを受け取れる電話番号を入力してください。
            <br />
            ※ 日本の電話番号のみ対応
          </p>
        </div>
        <div className="space-y-4 w-full">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">電話番号</Label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-4 w-full" />
          <Button className="mt-4">送信</Button>
        </div>
      </div>
    </div>
  );
}