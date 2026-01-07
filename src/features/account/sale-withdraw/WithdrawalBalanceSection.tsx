import React from 'react';
import { currencyFormat } from '@/utils/currencyFormat';

interface WithdrawalBalanceSectionProps {
  availableAmount: number;
}

export default function WithdrawalBalanceSection({
  availableAmount,
}: WithdrawalBalanceSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <p className="text-lg font-semibold text-gray-400 mb-4 text-center">売上金</p>
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {currencyFormat(availableAmount)}
        </div>
      </div>
    </div>
  );
}
