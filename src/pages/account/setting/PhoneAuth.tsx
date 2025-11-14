import AccountHeader from '@/features/account/components/AccountHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SendComplete from '@/components/common/SendComplete';

export default function PhoneAuth() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    navigate('/account/settings');
  };

  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader title="認証コード入力" showBackButton={false} />
      <div className="p-6 space-y-6 mt-16">
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">認証コード入力</h2>
          <p className="text-sm text-gray-600">お手持ちの認証コードを入力してください。</p>
        </div>
        <div className="space-y-4 w-full">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            認証コード
          </Label>
          <Input
            type="tel"
            value={code}
            placeholder="123456"
            onChange={(e) => {
              setCode(e.target.value);
              setError(''); // 入力時にエラーをクリア
            }}
            className={`mt-4 w-full ${error ? 'border-red-500' : ''}`}
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <Button className="mt-4" onClick={handleSubmit}>
            送信
          </Button>
        </div>
      </div>
      <SendComplete isOpen={isOpen} onClose={handleClose} for_address={code} send_type="code" />
    </div>
  );
}
