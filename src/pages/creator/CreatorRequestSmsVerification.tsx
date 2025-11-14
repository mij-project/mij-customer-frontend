import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createSmsVerification, verifySmsVerification } from '@/api/endpoints/sms_verifications';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ErrorMessage } from '@/components/common';

interface CreatorRequestSmsVerificationProps {
  onNext: (phone: string) => void;
  onBack: () => void;
}

const PURPOSE_CREATOR = 1;

export default function CreatorRequestSmsVerification({
  onNext,
  onBack,
}: CreatorRequestSmsVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState({ show: false, messages: [] });

  // 電話番号をE.164形式に変換する関数
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

  const handleSendCode = async () => {
    setError({ show: false, messages: [] });
    const regex = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    if (!phoneNumber) {
      // alert('電話番号を入力してください');
      setError({ show: true, messages: ['電話番号を入力してください'] });
      return;
    }
    if (!regex.test(phoneNumber) || phoneNumber.length < 11) {
      setError({ show: true, messages: ['電話番号が無効です'] });
      return;
    }
    const e164PhoneNumber = convertToE164(phoneNumber);

    setIsSending(true);
    try {
      const response = await createSmsVerification({
        phone_e164: e164PhoneNumber,
        purpose: PURPOSE_CREATOR,
      });

      if (response) {
        setIsCodeSent(true);
      } else {
        throw new Error('Failed to send SMS verification code');
      }
    } catch (error) {
      alert('SMS認証コードの送信に失敗しました');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    setError({ show: false, messages: [] });
    if (!verificationCode) {
      setError({ show: true, messages: ['認証コードを入力してください'] });
      // alert('認証コードを入力してください');
      return;
    }
    if (verificationCode.length !== 6) {
      setError({ show: true, messages: ['認証コードが無効です'] });
      // alert('認証コードが無効です');
      return;
    }
    const e164PhoneNumber = convertToE164(phoneNumber);

    setIsVerifying(true);
    try {
      const response = await verifySmsVerification({
        phone_e164: e164PhoneNumber,
        code: verificationCode,
        purpose: PURPOSE_CREATOR,
      });

      if (response) {
        setShowSuccessModal(true);
      } else {
        throw new Error('Failed to verify SMS verification code');
      }
    } catch (error) {
      // alert('認証コードが正しくありません');
      setError({ show: true, messages: ['認証コードが正しくありません'] });
      console.error(error);
    } finally {
      setIsVerifying(false);
      // setError({show: false, messages: []});
    }
  };

  const handleSuccessConfirm = () => {
    const e164PhoneNumber = convertToE164(phoneNumber);
    onNext(e164PhoneNumber);
  };

  const handleBackToPhoneInput = () => {
    setIsCodeSent(false);
    setVerificationCode('');
    setError({ show: false, messages: [] });
  };

  // モーダル表示時に背景のスクロールを無効化
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4"
        onClick={showSuccessModal ? undefined : onBack}
      >
        {/* モーダル */}
        <div
          className="relative bg-white rounded-3xl max-h-[90vh] w-full max-w-md overflow-y-auto z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative p-6">
            {/* 成功モーダル */}
            {showSuccessModal ? (
              <div className="max-w-md mx-auto text-center py-8">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">SMS認証が完了しました！</h2>
                <p className="text-gray-600 mb-8">次のステップに進んでください</p>
                <Button
                  onClick={handleSuccessConfirm}
                  className="w-full py-4 rounded-full font-semibold bg-primary text-white hover:bg-primary/90"
                >
                  OK
                </Button>
              </div>
            ) : (
              <>
                {/* 閉じるボタン */}
                <button
                  onClick={onBack}
                  className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                {/* 電話番号入力画面 */}
                {!isCodeSent ? (
                  <div className="max-w-md mx-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                      電話番号の認証
                    </h2>
                    <p className="text-sm text-gray-600 mb-6 text-center leading-relaxed">
                      ご利用者の安全をお守りするために電話番号の認証をお願いしております。
                      <br />
                      入力した電話番号に発信し、
                      <br />
                      音声で認証番号をお伝えします。
                    </p>
                    {error.show && <ErrorMessage message={error.messages} variant="error" />}
                    {/* 電話番号入力 */}
                    <div className="mb-4">
                      <Label
                        htmlFor="phone-number"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        電話番号
                      </Label>
                      <div className="flex items-center gap-2">
                        <select className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                          <option value="+81">🇯🇵 +81</option>
                        </select>
                        <Input
                          id="phone-number"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setError({ show: false, messages: [] });
                          }}
                          placeholder="09012345678"
                          className="flex-1"
                          maxLength={11}
                        />
                      </div>
                    </div>

                    {/* 送信ボタン */}
                    <Button
                      onClick={handleSendCode}
                      disabled={!phoneNumber || isSending}
                      className={`w-full py-4 rounded-full font-semibold transition-all ${
                        phoneNumber && !isSending
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isSending ? '送信中...' : '送信'}
                    </Button>

                    <button
                      onClick={handleBackToPhoneInput}
                      className="w-full mt-3 text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      認証コードを入力する
                    </button>
                  </div>
                ) : (
                  /* 認証コード入力画面 */
                  <div className="max-w-md mx-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                      電話番号の認証
                    </h2>
                    {error.show && <ErrorMessage message={error.messages} variant="error" />}
                    <p className="text-sm text-gray-600 mb-6 text-center">
                      電話で読み上げられた認証コードを入力してください。
                    </p>

                    {/* 認証コード入力 */}
                    <div className="mb-4">
                      <Label
                        htmlFor="verification-code"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        認証コード
                      </Label>
                      <Input
                        id="verification-code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="008507"
                        maxLength={6}
                        className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest"
                      />
                    </div>

                    {/* 認証ボタン */}
                    <Button
                      onClick={handleVerifyCode}
                      disabled={!verificationCode || isVerifying}
                      className={`w-full py-4 rounded-full font-semibold transition-all mb-3 ${
                        verificationCode && !isVerifying
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isVerifying ? '認証中...' : '認証する'}
                    </Button>

                    <Button
                      onClick={handleBackToPhoneInput}
                      className="w-full text-sm text-white hover:text-primary/80 font-medium"
                    >
                      電話番号を再入力する
                    </Button>

                    <p className="text-xs text-primary text-center mt-4 hover:text-primary/80 cursor-pointer">
                      着信が無い場合はこちら
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
