import { currencyFormat } from '@/utils/currencyFormat';
import React from 'react';

interface SalesSummarySectionProps {
  withdrawableAmount: number;
  totalSales: number;
  loading: boolean;
  errorMessage: string;
}

function SalesSummarySectionBase({
  withdrawableAmount,
  totalSales,
  loading,
  errorMessage,
}: SalesSummarySectionProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }
  if (errorMessage) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg p-4 flex flex-col gap-6 rounded-xl border text-card-foreground shadow-sm bg-black/3 py-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-bold">出金可能売上金額</span>
          <span className="text-2xl font-bold text-gray-900">
            {currencyFormat(withdrawableAmount)}
          </span>
        </div>
      </div>
      <div className="rounded-lg p-4 flex flex-col gap-6 rounded-xl border text-card-foreground shadow-sm bg-black/3 py-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-bold">累計売上金額</span>
          <span className="text-2xl font-bold text-gray-900">
            {currencyFormat(totalSales)}
          </span>
        </div>
      </div>
    </div>
  );
}

const SalesSummarySection = React.memo(SalesSummarySectionBase);

export default SalesSummarySection;