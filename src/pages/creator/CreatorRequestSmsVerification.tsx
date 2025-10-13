import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, CheckCircle } from 'lucide-react';
import VerificationLayout from '@/features/auth/VerificationLayout';

interface CreatorRequestSmsVerificationProps {
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: number;
    title: string;
    completed: boolean;
    current: boolean;
  }>;
}

export default function CreatorRequestSmsVerification({ onNext, onBack, currentStep, totalSteps, steps }: CreatorRequestSmsVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleSendCode = () => {
    if (!phoneNumber) {
      alert('電話番号を入力してください');
      return;
    }
    setIsCodeSent(true);
    console.log('SMS verification code sent to:', phoneNumber);
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      alert('認証コードを入力してください');
      return;
    }
    setIsVerified(true);
    console.log('SMS verification completed');
  };

  const handleNext = () => {
    if (!isVerified) {
      alert('SMS認証を完了してください');
      return;
    }
    onNext();
  };

  return (
    <VerificationLayout currentStep={currentStep} totalSteps={totalSteps} steps={steps}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary rounded-full">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            SMS認証
          </h2>
          <p className="text-sm text-gray-600">
            電話番号による本人確認を行います
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              電話番号
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="090-1234-5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isCodeSent}
            />
          </div>

          {!isCodeSent && (
            <Button
              onClick={handleSendCode}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              認証コードを送信
            </Button>
          )}

          {isCodeSent && !isVerified && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {phoneNumber} に認証コードを送信しました。
                  受信したコードを入力してください。
                </p>
              </div>
              
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  認証コード
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <Button
                onClick={handleVerifyCode}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                認証コードを確認
              </Button>
            </div>
          )}

          {isVerified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm text-green-800">
                  SMS認証が完了しました
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">SMS認証について</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 認証コードの有効期限は5分間です</li>
            <li>• SMSが届かない場合は、迷惑メールフォルダをご確認ください</li>
            <li>• 海外の電話番号には対応していません</li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            戻る
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isVerified}
            className="flex-1 bg-primary hover:bg-primary/90 text-white disabled:bg-gray-300"
          >
            次へ
          </Button>
        </div>
      </div>
    </VerificationLayout>
  );
}
