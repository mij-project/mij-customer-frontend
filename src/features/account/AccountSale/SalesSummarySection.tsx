import React from 'react';

interface SalesSummarySectionProps {
  withdrawableAmount: number;
  totalSales: number;
}

export default function SalesSummarySection({
  withdrawableAmount,
  totalSales,
}: SalesSummarySectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">出金可能売上金額</span>
          <span className="text-2xl font-bold text-gray-900">
            ¥{withdrawableAmount.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">累計売上金額</span>
          <span className="text-2xl font-bold text-gray-900">¥{totalSales.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
