import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import CreatorRequestSmsVerification from './CreatorRequestSmsVerification';
import CreatorRequestCertifierImage from './CreatorRequestCertifierImage';
import CreatorRequestGenreSelection from './CreatorRequestGenreSelection';
import CreatorRequestPlanSetup from './CreatorRequestPlanSetup';
import { registerCreator } from '@/api/endpoints/creator';
import Header from '@/components/common/Header';
import { useAuth } from '@/providers/AuthContext';

interface PlanData {
  planType: 'basic' | 'premium' | 'pro';
  monthlyFee: number;
  description: string;
}

export default function CreatorRequest() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  const { user } = useAuth();

  // user.is_phone_verifiedがtrueの場合はSMS認証済みとする
  const isSmsVerified = smsVerified || user?.is_phone_verified;

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
    setCurrentStep(3);
  };

  const handleGenreSelectionNext = (genders: string[]) => {
    setSelectedGenders(genders);
    setCurrentStep(4);
  };

  const handlePlanSetupNext = async (data: PlanData) => {
    setPlanData(data);

    setIsSubmitting(true);
    try {
      // クリエイター登録APIを呼び出す
      await registerCreator({
        name: '', // TODO: 必要に応じて追加のフォーム項目を実装
        phone_number: phoneNumber,
        gender_slug: selectedGenders,
      });
      setCurrentStep(5);
    } catch (error) {
      console.error('Creator registration error:', error);
      alert('クリエイター申請に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
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
      <CreatorRequestCertifierImage
        onNext={handleDocumentVerificationNext}
        onBack={handleBack}
      />
    );
  }

  // STEP3: クリエイタージャンル登録
  if (currentStep === 3) {
    return (
      <CreatorRequestGenreSelection
        onNext={handleGenreSelectionNext}
        onBack={handleBack}
        selectedGenders={selectedGenders}
      />
    );
  }

  // STEP4: プラン登録
  if (currentStep === 4) {
    return (
      <CreatorRequestPlanSetup
        onNext={handlePlanSetupNext}
        onBack={handleBack}
        currentStep={4}
        totalSteps={4}
        steps={[]}
      />
    );
  }

  // STEP5: 完了画面
  if (currentStep === 5) {
    return (
      <CommonLayout header={true}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
          <div className="flex items-center justify-center w-24 h-24 mb-8 bg-primary rounded-full">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            提出を受け付けました!!
          </h2>
          <p className="text-gray-600 mb-2">
            審査結果は46時間以内に
          </p>
          <p className="text-gray-900 font-semibold mb-2">
            sd@linkle.group
          </p>
          <p className="text-sm text-gray-600 mb-12 text-center">
            併せてサイト内で通知されますのでご確認ください
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full max-w-sm py-4 px-6 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            TOPに戻る
          </button>
        </div>
        <BottomNavigation />
      </CommonLayout>
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
            CandFansでクリエイターになるには、まず利用規約に同意する必要があります。利用規約に違反した場合、ユーザー情報が確認機関に提出される場合があります。
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
            CandFansの利用規約を読み、同意しました。
          </label>
        </div>

        {/* ステップカード */}
        <div className="space-y-4">
          {/* STEP1: SMS認証 */}
          <button
            onClick={agreedToTerms && !isSmsVerified ? () => {
              setCurrentStep(1);
              setShowSmsModal(true);
            } : undefined}
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
              <div className={`px-4 py-2 rounded-full text-sm font-bold mr-4 ${
                isSmsVerified ? 'bg-green-100' : 'bg-white/20'
              }`}>
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
            onClick={isSmsVerified ? () => {
              setCurrentStep(2);
            } : undefined}
            disabled={!isSmsVerified}
            className={`w-full p-6 rounded-2xl flex items-center justify-between transition-all ${
              isSmsVerified
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center">
              <div className={`px-4 py-2 rounded-full text-sm font-bold mr-4 ${
                isSmsVerified ? 'bg-white/20' : 'border-2 border-gray-300 text-gray-600'
              }`}>
                STEP2
              </div>
              <span className="text-xl font-bold">本人確認</span>
            </div>
            {isSmsVerified && <ChevronRight className="h-6 w-6" />}
          </button>

          {/* STEP3: クリエイタージャンル登録 */}
          <div className="w-full p-6 rounded-2xl bg-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <div className="border-2 border-gray-300 px-4 py-2 rounded-full text-sm font-bold mr-4 text-gray-600">
                STEP3
              </div>
              <span className="text-xl font-bold text-gray-600">クリエイタージャンル登録</span>
            </div>
          </div>

          {/* STEP4: プラン登録 */}
          <div className="w-full p-6 rounded-2xl bg-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <div className="border-2 border-gray-300 px-4 py-2 rounded-full text-sm font-bold mr-4 text-gray-600">
                STEP4
              </div>
              <span className="text-xl font-bold text-gray-600">プラン登録</span>
            </div>
          </div>
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
