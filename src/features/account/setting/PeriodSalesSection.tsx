import React from 'react';

interface PeriodSalesSectionProps {
  singleItemSales: number;
  planSales: number;
}

export default function PeriodSalesSection({
  singleItemSales,
  planSales,
}: PeriodSalesSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">期間別売上</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">単品売上</div>
          <div className="text-xl font-bold text-blue-900">¥{singleItemSales}</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-green-600 mb-1">プラン売上</div>
          <div className="text-xl font-bold text-green-900">¥{planSales}</div>
        </div>
      </div>
    </div>
  );
}
