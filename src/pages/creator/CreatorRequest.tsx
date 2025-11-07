import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import CreatorRequestSmsVerification from './CreatorRequestSmsVerification';
import CreatorRequestCertifierImage from './CreatorRequestCertifierImage';
import CreatorRequestGenreSelection from './CreatorRequestGenreSelection';
import { registerCreator } from '@/api/endpoints/creator';
import Header from '@/components/common/Header';
import { useAuth } from '@/providers/AuthContext';

export default function CreatorRequest() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const { user } = useAuth();

  // user.is_phone_verifiedがtrueの場合はSMS認証済みとする
  const isSmsVerified = smsVerified || user?.is_phone_verified;
  const isIdentityVerified = identityVerified || user?.is_identity_verified;

  const handleStartApplication = () => {
    if (!agreedToTerms) {
      alert('利用規約に同意してください');
      return;
    }
    setCurrentStep(1);
    setShowSmsModal(true);
  };

  const handleSmsVerificationComplete = (phone: string) => {
    setPhoneNumber(phone);
    setSmsVerified(true);
    setShowSmsModal(false);
    setCurrentStep(0);
  };

  const handleDocumentVerificationNext = () => {
    setIdentityVerified(true);
    setCurrentStep(3);
  };

  const handleGenreSelectionComplete = async (genders: string[]) => {
    setSelectedGenders(genders);

    try {
      // クリエイター登録APIを呼び出す
      await registerCreator({
        name: '', // TODO: 必要に応じて追加のフォーム項目を実装
        phone_number: phoneNumber,
        gender_slug: genders,
      });
      // 完了後はTOPに戻る
      navigate('/');
    } catch (error) {
      console.error('Creator registration error:', error);
      alert('クリエイター申請に失敗しました。もう一度お試しください。');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  // STEP1: SMS認証（モーダル表示） - 背景も表示するため、ここでは何もしない

  // STEP2: 本人確認
  if (currentStep === 2) {
    return (
      <CreatorRequestCertifierImage onNext={handleDocumentVerificationNext} onBack={handleBack} />
    );
  }

  // STEP3: クリエイタージャンル登録
  if (currentStep === 3) {
    return (
      <CreatorRequestGenreSelection
        onNext={handleGenreSelectionComplete}
        onBack={handleBack}
        selectedGenders={selectedGenders}
      />
    );
  }

  // STEP0: 初期画面とステップカード
  return (
    <CommonLayout header={true}>
      <Header />
      <div className="min-h-screen px-4 py-6">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center mr-8">クリエイター申請</h1>
        </div>

        {/* 説明文 */}
        <div className="mb-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            mijfansでクリエイターになるには、まず利用規約に同意する必要があります。利用規約に違反した場合、ユーザー情報が確認機関に提出される場合があります。
          </p>
        </div>

        {/* チェックボックス */}
        <div className="flex items-start space-x-2 mb-6">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            mijfansの利用規約を読み、同意しました。
          </label>
        </div>

        {/* ステップカード */}
        <div className="space-y-4">
          {/* STEP1: SMS認証 */}
          <button
            onClick={
              agreedToTerms && !isSmsVerified
                ? () => {
                    setCurrentStep(1);
                    setShowSmsModal(true);
                  }
                : undefined
            }
            disabled={!agreedToTerms || isSmsVerified}
            className={`w-full p-6 rounded-2xl flex items-center justify-between transition-all ${
              isSmsVerified
                ? 'bg-green-50 border-2 border-green-500 text-green-700 cursor-default'
                : agreedToTerms
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center">
              <div
                className={`px-4 py-2 rounded-full text-sm font-bold mr-4 ${
                  isSmsVerified ? 'bg-green-100' : 'bg-white/20'
                }`}
              >
                STEP1
              </div>
              <span className="text-xl font-bold">SMS認証</span>
            </div>
            {isSmsVerified ? (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
                <Check className="h-5 w-5 text-white" />
              </div>
            ) : (
              <ChevronRight className="h-6 w-6" />
            )}
          </button>

          {/* STEP2: 本人確認 */}
          <button
            onClick={
              isSmsVerified && !isIdentityVerified
                ? () => {
                    setCurrentStep(2);
                  }
                : undefined
            }
            disabled={!isSmsVerified || isIdentityVerified}
            className={`w-full p-6 rounded-2xl flex items-center justify-between transition-all ${
              isIdentityVerified
                ? 'bg-green-50 border-2 border-green-500 text-green-700 cursor-default'
                : isSmsVerified
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center">
              <div
                className={`px-4 py-2 rounded-full text-sm font-bold mr-4 ${
                  isIdentityVerified
                    ? 'bg-green-100'
                    : isSmsVerified
                      ? 'bg-white/20'
                      : 'border-2 border-gray-300 text-gray-600'
                }`}
              >
                STEP2
              </div>
              <span className="text-xl font-bold">本人確認</span>
            </div>
            {isIdentityVerified ? (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
                <Check className="h-5 w-5 text-white" />
              </div>
            ) : isSmsVerified ? (
              <ChevronRight className="h-6 w-6" />
            ) : null}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>クリエイタージャンル登録は任意です。</strong>
            <br />
            本人確認完了後に、必要に応じてクリエイタージャンル登録を行うことができます。
          </p>
        </div>
      </div>

      {/* SMS認証モーダル */}
      {showSmsModal && (
        <CreatorRequestSmsVerification
          onNext={handleSmsVerificationComplete}
          onBack={() => {
            setShowSmsModal(false);
            setCurrentStep(0);
          }}
        />
      )}

      <BottomNavigation />
    </CommonLayout>
  );
}
