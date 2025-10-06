import React from 'react';
import { AccountInfo } from '@/features/account/types';

interface JoinedPlansSectionProps {
  accountInfo: AccountInfo | null;
}

export default function JoinedPlansSection({ accountInfo }: JoinedPlansSectionProps) {
  const subscribedPlans = accountInfo?.plan_info?.subscribed_plan_details || [];
  const subscribedCount = accountInfo?.plan_info?.subscribed_plan_count || 0;
  const totalPrice = accountInfo?.plan_info?.subscribed_total_price || 0;

  return (
    <div className="px-6 py-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-gray-900 mb-4">加入中のプラン</h3>
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-gray-900">{subscribedCount}件</div>
          <div className="text-sm text-gray-600">月額合計: {totalPrice}円</div>
        </div>
        
        {subscribedPlans.length > 0 ? (
          <div className="space-y-2">
            {subscribedPlans.map((plan: any, index: number) => (
              <div key={index} className="border border-gray-100 rounded p-3">
                <div className="font-medium">{plan.plan_name || `プラン ${index + 1}`}</div>
                <div className="text-sm text-gray-600">{plan.plan_description || ''}</div>
                <div className="text-sm text-gray-600">{plan.price || 0}円/月</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            加入中のプランはありません
          </div>
        )}
      </div>
    </div>
  );
}
