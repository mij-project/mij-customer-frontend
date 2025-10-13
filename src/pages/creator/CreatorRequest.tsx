import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, FileText, CreditCard, User } from 'lucide-react';
import AuthLayout from '@/features/auth/AuthLayout';
import QreatorRequestSmsVerification from './CreatorRequestSmsVerification';
import QreatorRequestPersonalInfo from './CreatorRequestPersonalInfo';
import QreatorRequestCertifierImage from './CreatorRequestCertifierImage';
import QreatorRequestPlanSetup from './CreatorRequestPlanSetup';
import { registerCreator } from '@/api/endpoints/creator';

interface ApplicationStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  current: boolean;
}

interface PersonalInfo {
  name: string;
  firstNameKana: string;
  lastNameKana: string;
  birthDate: string;
  address: string;
  phoneNumber: string;
}

interface PlanData {
  planType: 'basic' | 'premium' | 'pro';
  monthlyFee: number;
  description: string;
}

export default function CreatorRequest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: ApplicationStep[] = [
    {
      id: 1,
      title: 'SMS認証',
      description: '電話番号による本人確認',
      icon: <Phone className="h-6 w-6" />,
      completed: currentStep > 1,
      current: currentStep === 1
    },
    {
      id: 2,
      title: '個人情報入力',
      description: '基本情報の入力',
      icon: <User className="h-6 w-6" />,
      completed: currentStep > 2,
      current: currentStep === 2
    },
    {
      id: 3,
      title: '身分証明書確認',
      description: '身分証明書のアップロード',
      icon: <FileText className="h-6 w-6" />,
      completed: currentStep > 3,
      current: currentStep === 3
    },
    {
      id: 4,
      title: 'プラン登録',
      description: 'クリエイタープランの設定',
      icon: <CreditCard className="h-6 w-6" />,
      completed: currentStep > 4,
      current: currentStep === 4
    },
    {
      id: 5,
      title: '完了',
      description: 'クリエイター申請が完了しました',
      icon: <CheckCircle className="h-6 w-6" />,
      completed: currentStep > 5,
      current: currentStep === 5
    }
  ];

  const handleStartApplication = () => {
    if (!agreedToTerms) {
      alert('利用規約に同意してください');
      return;
    }
    setCurrentStep(1);
  };

  const handleSmsVerificationNext = () => {
    setCurrentStep(2);
  };

  const handlePersonalInfoNext = () => {
    setCurrentStep(3);
  };

  const handleDocumentVerificationNext = () => {
    setCurrentStep(4);
  };

  const handlePlanSetupNext = async (data: PlanData) => {
    setPlanData(data);
    
    if (!personalInfo) {
      alert('個人情報が入力されていません');
      return;
    }

    setIsSubmitting(true);
    try {
      setCurrentStep(5);
    } catch (error) {
      console.error('Creator registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (currentStep === 1) {
    return (
      <QreatorRequestSmsVerification
        onNext={handleSmsVerificationNext}
        onBack={handleBack}
        currentStep={currentStep}
        totalSteps={4}
        steps={steps}
      />
    );
  }

  if (currentStep === 2) {
    return (
      <QreatorRequestPersonalInfo
        onNext={handlePersonalInfoNext}
        onBack={handleBack}
        currentStep={currentStep}
        totalSteps={4}
        steps={steps}
      />
    );
  }

  if (currentStep === 3) {
    return (
      <QreatorRequestCertifierImage
        onNext={handleDocumentVerificationNext}
        onBack={handleBack}
        currentStep={currentStep}
        totalSteps={4}
        steps={steps}
      />
    );
  }

  if (currentStep === 4) {
    return (
      <QreatorRequestPlanSetup
        onNext={handlePlanSetupNext}
        onBack={handleBack}
        currentStep={currentStep}
        totalSteps={4}
        steps={steps}
      />
    );
  }

  if (currentStep === 5) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            申請完了
          </h2>
          <p className="text-sm text-gray-600">
            クリエイター申請が正常に完了しました。<br />
            審査結果は3-5営業日以内にメールでお知らせいたします。
          </p>
          <Button
            onClick={() => window.location.href = '/account'}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            マイページへ
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            クリエイター申請手続き
          </h2>
          <p className="text-sm text-gray-600">
            以下の手順でクリエイター申請を行ってください
          </p>
        </div>


        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">申請前の確認事項</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 18歳以上であること</li>
            <li>• 有効な身分証明書をお持ちであること</li>
            <li>• 利用規約に同意いただけること</li>
          </ul>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            <a href="#" className="text-primary hover:text-primary/80">
              利用規約
            </a>
            に同意します
          </label>
        </div>

        <Button
          onClick={handleStartApplication}
          disabled={!agreedToTerms || isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-white disabled:bg-gray-300"
        >
          {isSubmitting ? '申請中...' : '申請を開始する'}
        </Button>
      </div>
    </AuthLayout>
  );
}
