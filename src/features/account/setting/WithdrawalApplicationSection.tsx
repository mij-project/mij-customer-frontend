import React from 'react';

interface WithdrawalApplicationSectionProps {
  fee: number;
}

export default function WithdrawalApplicationSection({ fee }: WithdrawalApplicationSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">出金申請</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">手数料</span>
          <span className="text-gray-900">{fee}円</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">振込金額</span>
          <span className="text-gray-900">0円</span>
        </div>
      </div>
    </div>
  );
}
