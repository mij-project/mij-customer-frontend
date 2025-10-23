import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check } from 'lucide-react';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';

interface PlanData {
  planType: 'basic' | 'premium' | 'pro';
  monthlyFee: number;
  description: string;
}

interface CreatorRequestPlanSetupProps {
  onNext: (data: PlanData) => void;
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

const plans = [
  {
    id: 'basic' as const,
    name: 'ベーシックプラン',
    monthlyFee: 500,
    description: '基本的な機能を利用できます',
    features: [
      '月額500円',
      '動画投稿無制限',
      '基本的な分析機能',
      'コミュニティ機能'
    ]
  },
  {
    id: 'premium' as const,
    name: 'プレミアムプラン',
    monthlyFee: 1000,
    description: '充実した機能でクリエイター活動をサポート',
    features: [
      '月額1,000円',
      '動画投稿無制限',
      '詳細な分析機能',
      'コミュニティ機能',
      'ライブ配信機能',
      '優先サポート'
    ],
    recommended: true
  },
  {
    id: 'pro' as const,
    name: 'プロプラン',
    monthlyFee: 2000,
    description: 'プロクリエイター向けの最上位プラン',
    features: [
      '月額2,000円',
      '動画投稿無制限',
      '高度な分析機能',
      'コミュニティ機能',
      'ライブ配信機能',
      '専属サポート',
      'カスタムブランディング',
      'API連携'
    ]
  }
];

export default function CreatorRequestPlanSetup({ onNext, onBack, currentStep, totalSteps, steps }: CreatorRequestPlanSetupProps) {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'pro'>('premium');

  const handleSubmit = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    onNext({
      planType: selectedPlan,
      monthlyFee: plan.monthlyFee,
      description: plan.description
    });
  };

  return (
    <CommonLayout header={false}>
      <div className="min-h-screen px-4 py-6">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center mr-8">プラン登録</h1>
        </div>

        <div className="space-y-6 mb-24">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              あなたに最適なクリエイタープランを選択してください
            </p>
          </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.recommended ? 'ring-2 ring-primary ring-opacity-20' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    おすすめ
                  </span>
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <div className="ml-3 text-2xl font-bold text-primary">
                      ¥{plan.monthlyFee.toLocaleString()}
                      <span className="text-sm font-normal text-gray-600">/月</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === plan.id
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {selectedPlan === plan.id && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">プランについて</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• プランはいつでも変更可能です</li>
              <li>• 初月は無料でお試しいただけます</li>
              <li>• 支払いは月末締めの翌月請求となります</li>
              <li>• 解約はいつでも可能です</li>
            </ul>
          </div>
        </div>

        {/* 次へボタン（固定） */}
        <div className="fixed bottom-20 left-0 right-0 px-4 py-4 bg-white border-t border-gray-200">
          <div className="max-w-screen-md mx-auto">
            <button
              onClick={handleSubmit}
              className="w-full py-4 px-6 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              このプランで申請する
            </button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </CommonLayout>
  );
}
