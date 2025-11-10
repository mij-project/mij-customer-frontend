import React from 'react';

interface WithdrawalBalanceSectionProps {
  availableAmount: number;
}

export default function WithdrawalBalanceSection({
  availableAmount,
}: WithdrawalBalanceSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">売上金</h2>
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">{availableAmount}円</div>
      </div>
    </div>
  );
}
