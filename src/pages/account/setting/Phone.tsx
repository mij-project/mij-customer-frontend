import AccountHeader from '@/features/account/components/AccountHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SendComplete from '@/components/common/SendComplete';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage } from '@/components/common';
import { requestSettingPhone as requestSettingPhoneAPI } from '@/api/endpoints/account';
import { UserRole } from '@/utils/userRole';
import CreatorRequestDialog from '@/components/common/CreatorRequestDialog';
import { useAuth } from '@/providers/AuthContext';

export default function Phone() {
  const [phone, setPhone] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [showModelRequestCreator, setShowModelRequestCreator] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role !== UserRole.CREATOR) {
      setShowModelRequestCreator(true);
    }
  }, [user?.role]);

  // 電話番号をE.164形式に˝変換する関数
  const convertToE164 = (phone: string): string => {
    // 数字以外を除去
    const digitsOnly = phone.replace(/\D/g, '');

    // 日本の電話番号の場合
    if (digitsOnly.startsWith('0')) {
      // 0を+81に置き換え
      return '81' + digitsOnly.substring(1);
    } else if (digitsOnly.startsWith('81')) {
      // 81で始まる場合は+を追加
      return '+' + digitsOnly;
    } else if (digitsOnly.startsWith('81')) {
      // 既に81で始まっている場合はそのまま
      return digitsOnly;
    } else {
      // その他の場合は81を追加
      return '81' + digitsOnly;
    }
  };
  // 日本の電話番号のバリデーション
  const validatePhoneNumber = (phoneNumber: string): boolean => {
    // ハイフンなしの数字のみを許可（10桁または11桁）
    const phoneRegex = /^(0[0-9]{9,10})$/;
    // ハイフン付きの形式も許可
    const phoneWithHyphenRegex = /^(0\d{1,4}-\d{1,4}-\d{4})$/;

    return phoneRegex.test(phoneNumber) || phoneWithHyphenRegex.test(phoneNumber);
  };
  const requestSettingPhone = async (phone: string) => {
    try {
      setError('');
      const res = await requestSettingPhoneAPI(phone);
      if (res.status !== 200) {
        throw new Error('電話番号の設定に失敗しました');
      }
      setIsOpen(true);
    } catch (error) {
      if (error.response.status === 400) {
        setError('電話番号がすでに使用されています');
        return;
      }
      setError('電話番号の設定に失敗しました');
    }
  };
  const handleSubmit = () => {
    setError('');

    if (!phone) {
      setError('電話番号を入力してください');
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setError('正しい電話番号の形式で入力してください（例: 09012345678 または 090-1234-5678）');
      return;
    }
    requestSettingPhone(convertToE164(phone) as string);
  };

  const handleClose = () => {
    setIsOpen(false);
    navigate('/account/phone-auth', { state: { phone: convertToE164(phone) } });
  };
  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader
        title="電話番号認証"
        showBackButton={true}
        onBack={() => navigate('/account/settings')}
      />
      <div className="p-6 space-y-6 mt-16">
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">電話番号の認証</h2>
          <p className="text-sm text-gray-600">
            お手持ちの認証コードを受け取れる電話番号を入力してください。
            <br />※ 日本の電話番号のみ対応
          </p>
        </div>
        <div className="space-y-4 w-full">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            電話番号
          </Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError(''); // 入力時にエラーをクリア
            }}
            className={`mt-4 w-full ${error ? 'border-red-500' : ''}`}
            placeholder="09012345678"
          />
          {error && <ErrorMessage message={error} variant="error" />}
          <Button className="mt-4" onClick={handleSubmit}>
            送信
          </Button>
        </div>
      </div>
      <SendComplete isOpen={isOpen} onClose={handleClose} for_address={phone} send_type="phone" />
      <CreatorRequestDialog
        isOpen={showModelRequestCreator}
        onClose={() => navigate('/account/settings')}
      />
    </div>
  );
}
