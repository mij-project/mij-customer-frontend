import React, { useState, useEffect, useCallback } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';

// セクションコンポーネントをインポート
import WithdrawalHeaderSection from '@/features/account/sale/WithdrawalHeaderSection';
import SalesSummarySection from '@/features/account/sale/SalesSummarySection';
import GraphicalSalesSection from '@/features/account/sale/GraphicalSalesSection';
import SalesHistorySection from '@/features/account/sale/SalesHistorySection';
import { getCreatorsSalesHistory, getCreatorsSalesPeriodData, getCreatorsSalesSummary } from '@/api/endpoints/sales';
import { SalesHistory, SalesPeriodData, SalesSummary } from '@/api/types/sales';

export default function Sale() {
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState<string>('');
  const [salesSummary, setSalesSummary] = useState<SalesSummary>({
    cumulative_sales: 0,
    withdrawable_amount: 0,
  })

  const [loadingPeriodData, setLoadingPeriodData] = useState(false);
  const [period, setPeriod] = useState<string>('today');
  const [errorPeriodData, setErrorPeriodData] = useState<string>('');
  const [salesPeriodData, setSalesPeriodData] = useState<SalesPeriodData>({
    period_sales: 0,
    single_item_sales: 0,
    plan_sales: 0,
    previous_period_sales: 0,
  });

  const [saleHistories, setSaleHistories] = useState<SalesHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  
  const fetchSalesSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const res = await getCreatorsSalesSummary();
      if (res.status !== 200) {
        throw new Error('売上サマリ取得エラー');
      }
      setSalesSummary({
        cumulative_sales: res.data.cumulative_sales,
        withdrawable_amount: res.data.withdrawable_amount,
      });
    } catch (error) {
      console.error('売上サマリ取得エラー:', error);
      setErrorSummary('売上データ取得エラー');
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchSalesPeriodData = useCallback(async (period: string) => {
    try {
      setLoadingPeriodData(true);
      const res = await getCreatorsSalesPeriodData(period);
      if (res.status !== 200) {
        throw new Error('売上データ取得エラー');
      }
      setSalesPeriodData({
        period_sales: res.data.period_sales,
        single_item_sales: res.data.single_item_sales,
        plan_sales: res.data.plan_sales,
        previous_period_sales: res.data.previous_period_sales,
      });

    } catch (error) {
      console.error('売上データ取得エラー:', error);
      setErrorPeriodData('売上データ取得エラー');
    } finally {
      setLoadingPeriodData(false);
    }
  }, []);

  const fetchSalesHistory = useCallback(async (period: string, page: number) => {
    try {
      setLoadingHistory(true);
      const res = await getCreatorsSalesHistory(page, 20, period);
      if (res.status !== 200) {
        throw new Error('売上履歴取得エラー');
      }
      setSaleHistories(res.data.payments);
      setHasNext(res.data.has_next);
      setHasPrevious(res.data.has_previous);
      setTotalPages(res.data.total_pages);
    } catch (error) {
      console.error('売上履歴取得エラー:', error);
      setErrorHistory('売上履歴取得エラー');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesSummary();
    fetchSalesPeriodData(period);
    fetchSalesHistory(period, page);
  }, [fetchSalesSummary, fetchSalesPeriodData, fetchSalesHistory]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    fetchSalesPeriodData(newPeriod);
    fetchSalesHistory(newPeriod, page);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchSalesHistory(period, newPage);
  };

  return (
    <div className="bg-white">
      <AccountHeader title="売上管理" showBackButton />

      <div className="p-6 space-y-6 mt-16">
        {/* Withdrawal Header Section */}
        <WithdrawalHeaderSection />

        {/* Sales Summary Section */}
        <SalesSummarySection
          withdrawableAmount={salesSummary.withdrawable_amount}
          totalSales={salesSummary.cumulative_sales}
          loading={loadingSummary}
          errorMessage={errorSummary}
        />

        {/* Graph Sales Section with Chart */}
        <GraphicalSalesSection
          periodSales={salesPeriodData.period_sales}
          singleItemSales={salesPeriodData.single_item_sales}
          planSales={salesPeriodData.plan_sales}
          previousPeriodSales={salesPeriodData.previous_period_sales}
          period={period}
          loading={loadingPeriodData}
          errorMessage={errorPeriodData}
          onPeriodChange={handlePeriodChange}
        />

        {/* Sales History Section */}
        <SalesHistorySection
          saleHistories={saleHistories}
          loading={loadingHistory}
          errorMessage={errorHistory}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          totalPages={totalPages}
          page={page}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
