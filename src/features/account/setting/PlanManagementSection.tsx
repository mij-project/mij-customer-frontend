import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanManagementSectionProps } from '@/features/account/personal/section/types';

export default function PlanManagementSection({ accountInfo }: PlanManagementSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-2">プラン管理</h3>
      <div className="flex justify-center space-x-8 mb-4">
        <div className="text-left">
          <div className="text-gray-600 text-[10px] mb-1">運用中プラン</div>
          <div className="text-2xl font-bold text-gray-900">
            {accountInfo?.plan_info?.plan_count || 0}
            <span className="text-sm font-normal text-gray-600">プラン</span>
          </div>
        </div>
        <div className="text-left">
          <div className="text-gray-600 text-[10px] mb-1">プラン月間売上</div>
          <div className="text-2xl font-bold text-gray-900">
            {accountInfo?.plan_info?.total_price || 0}
            <span className="text-sm font-normal text-gray-600">円</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <button
          className="w-full text-pink-500 text-sm text-center"
          onClick={() => navigate('/account/plan')}
        >
          全て見る &gt;
        </button>
      </div>
    </div>
  );
}
