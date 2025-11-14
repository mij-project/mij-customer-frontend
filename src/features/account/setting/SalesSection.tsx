import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesSectionProps } from '@/features/account/section/types';

export default function SalesSection({ accountInfo }: SalesSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-2">売上金</h3>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-gray-900">
          {accountInfo?.sales_info?.total_sales || 0}円
        </div>
      </div>
      <div className="space-y-2">
        <button
          className="w-full text-pink-500 text-sm text-center"
          onClick={() => navigate('/account/sale')}
        >
          売上金の詳細 &gt;
        </button>
        <button
          className="w-full text-pink-500 text-sm text-center"
          onClick={() => navigate('/account/sale-withdraw')}
        >
          出金申請 &gt;
        </button>
      </div>
    </div>
  );
}
