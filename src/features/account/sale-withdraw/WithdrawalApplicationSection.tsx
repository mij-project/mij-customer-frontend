import { Input } from '@/components/ui/input';
import React from 'react';

interface WithdrawalApplicationSectionProps {
  withdrawalAmount: number;
  withdrawalFee: number;
  handleWithdrawalAmountChange: (amount: number) => void;
  withdrawalNotice?: string;
  transferAmount: number;
}

export default function WithdrawalApplicationSection({
  withdrawalAmount = 0,
  withdrawalFee = 350,
  handleWithdrawalAmountChange,
  withdrawalNotice,
  transferAmount,
}: WithdrawalApplicationSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-gray-900 mb-4">出金申請</p>
        <p className="text-xs text-red-500">{withdrawalNotice}</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">出金額</span>
          <div className="flex items-center gap-1 flex-1"></div>
          <div className="flex items-center gap-1 flex-1 justify-end border-b border-gray-300">
            <input
              type="text"
              inputMode="numeric"
              value={withdrawalAmount || ''}
              onChange={(e) => {
                handleWithdrawalAmountChange(Number(e.target.value));
              }}
              placeholder="0"
              className="text-right text-base text-gray-900 bg-transparent border-b focus:outline-none focus:ring-0"
            />
            <span className="text-base text-gray-900">円</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">振込手数料</span>
          <span className="text-gray-900">{withdrawalFee.toLocaleString() || 0}円</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">振込金額</span>
          <span className="text-gray-900">{transferAmount.toLocaleString() || 0}円</span>
        </div>
      </div>
    </div>
  );
}
