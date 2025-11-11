import React, { useState, useEffect } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';

// セクションコンポーネントをインポート
import WithdrawalHeaderSection from '@/features/account/setting/WithdrawalHeaderSection';
import SalesSummarySection from '@/features/account/setting/SalesSummarySection';
import TodaySalesSection from '@/features/account/setting/TodaySalesSection';
import SalesHistorySection from '@/features/account/setting/SalesHistorySection';
import { getSalesData, getSalesTransactions } from '@/api/endpoints/purchases';
import { SalesData, SalesTransaction } from '@/api/types/purchases';

export default function Sale() {
  const [salesData, setSalesData] = useState<SalesData>({
    withdrawable_amount: 0,
    total_sales: 0,
    period_sales: 0,
    single_item_sales: 0,
    plan_sales: 0,
  });
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('today');

  const fetchSalesData = async (selectedPeriod: string) => {
    try {
      setLoading(true);

      // 売上データと履歴を並行して取得
      const [salesResponse, transactionsResponse] = await Promise.all([
        getSalesData(selectedPeriod),
        getSalesTransactions(50),
      ]);

      setSalesData(salesResponse);
      setTransactions(transactionsResponse.transactions);
    } catch (error) {
      console.error('売上データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(period);
  }, []);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    fetchSalesData(newPeriod);
  };

  if (loading) {
    return (
      <div className="bg-white">
        <AccountHeader title="売上管理" showBackButton />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <AccountHeader title="売上管理" showBackButton />

      <div className="p-6 space-y-6 mt-16">
        {/* Withdrawal Header Section */}
        <WithdrawalHeaderSection />

        {/* Sales Summary Section */}
        <SalesSummarySection
          withdrawableAmount={salesData.withdrawable_amount}
          totalSales={salesData.total_sales}
        />

        {/* Today Sales Section with Chart */}
        <TodaySalesSection
          periodSales={salesData.period_sales}
          singleItemSales={salesData.single_item_sales}
          planSales={salesData.plan_sales}
          period={period}
          onPeriodChange={handlePeriodChange}
        />

        {/* Sales History Section */}
        <SalesHistorySection transactions={transactions} />
      </div>
    </div>
  );
}
