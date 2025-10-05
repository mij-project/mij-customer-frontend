import React from 'react';
import AccountHeader from '@/features/account/component/AccountHeader';

// セクションコンポーネントをインポート
import WithdrawalHeaderSection from '@/features/account/AccountSale/WithdrawalHeaderSection';
import SalesSummarySection from '@/features/account/AccountSale/SalesSummarySection';
import TodaySalesSection from '@/features/account/AccountSale/TodaySalesSection';
import PeriodSalesSection from '@/features/account/AccountSale/PeriodSalesSection';
import SalesHistorySection from '@/features/account/AccountSale/SalesHistorySection';

interface SalesData {
  withdrawableAmount: number;
  totalSales: number;
  todaySales: number;
  singleItemSales: number;
  planSales: number;
}

interface SalesTransaction {
  id: string;
  date: string;
  type: 'single' | 'plan';
  title: string;
  amount: number;
  buyer: string;
}

const mockSalesData: SalesData = {
  withdrawableAmount: 0,
  totalSales: 0,
  todaySales: 0,
  singleItemSales: 0,
  planSales: 0
};

const mockTransactions: SalesTransaction[] = [
  {
    id: '1',
    date: '2025/08/01',
    type: 'single',
    title: 'サンプル動画',
    amount: 1000,
    buyer: 'ユーザー1'
  },
  {
    id: '2',
    date: '2025/08/02',
    type: 'plan',
    title: 'ベーシックプラン',
    amount: 1500,
    buyer: 'ユーザー2'
  }
];

export default function AccountSale() {
  return (
    <div className="bg-white">
      <AccountHeader title="売上管理" showBackButton />
      
      <div className="p-6 space-y-6 mt-16">
        {/* Withdrawal Header Section */}
        <WithdrawalHeaderSection />

        {/* Sales Summary Section */}
        <SalesSummarySection 
          withdrawableAmount={mockSalesData.withdrawableAmount}
          totalSales={mockSalesData.totalSales}
        />

        {/* Today Sales Section */}
        <TodaySalesSection todaySales={mockSalesData.todaySales} />

        {/* Period Sales Section */}
        <PeriodSalesSection 
          singleItemSales={mockSalesData.singleItemSales}
          planSales={mockSalesData.planSales}
        />

        {/* Sales History Section */}
        <SalesHistorySection transactions={mockTransactions} />
      </div>
    </div>
  );
}
