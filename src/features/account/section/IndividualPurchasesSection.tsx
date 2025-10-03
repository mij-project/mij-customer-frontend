import React from 'react';
import { AccountInfo } from '@/features/account/types';

interface IndividualPurchasesSectionProps {
  accountInfo: AccountInfo | null;
}

export default function IndividualPurchasesSection({ accountInfo }: IndividualPurchasesSectionProps) {
  const singlePurchases = accountInfo?.plan_info?.single_purchases_data || [];
  const purchaseCount = accountInfo?.plan_info?.single_purchases_count || 0;

  return (
    <div className="px-6 py-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-gray-900 mb-4">単品購入履歴</h3>
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-gray-900">{purchaseCount}件</div>
        </div>
        
        {singlePurchases.length > 0 ? (
          <div className="space-y-2">
            {singlePurchases.map((purchase: any, index: number) => (
              <div key={index} className="border border-gray-100 rounded p-3">
                <div className="font-medium">{purchase.title || `購入 ${index + 1}`}</div>
                <div className="text-sm text-gray-600">{purchase.price || 0}円</div>
                <div className="text-xs text-gray-500">{purchase.created_at || ''}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            単品購入履歴はありません
          </div>
        )}
      </div>
    </div>
  );
}
