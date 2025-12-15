import React, { useEffect, useState } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';

// セクションコンポーネントをインポート
import WithdrawalBalanceSection from '@/features/account/sale-withdraw/WithdrawalBalanceSection';
import WithdrawalApplicationSection from '@/features/account/sale-withdraw/WithdrawalApplicationSection';
import BankAccountSection from '@/features/account/setting/BankAccountSection';
import WithdrawalHistorySection from '@/features/account/sale-withdraw/WithdrawalHistorySection';
import { Button } from '@/components/ui/button';
import { getCreatorsSalesSummary, getWithdrawalHistories, submitWithdrawalApplication } from '@/api/endpoints/sales';
import { getUserBankDefaultInformation } from '@/api/endpoints/user_banks';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useNavigate } from 'react-router-dom';
import { BankAccount } from '@/api/types/user_banks';
import { AxiosError } from 'axios';
import { WithdrawalApplicationRequest } from '@/api/types/sales';

export default function SaleWithDraw() {

  const navigate = useNavigate();
  const [availableAmount, setAvailableAmount] = useState<number>(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [withdrawalNotice, setWithdrawalNotice] = useState<string>('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(false);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalHistories, setWithdrawalHistories] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyTotalPage, setHistoryTotalPage] = useState<number>(1);
  const [historyHasNextPage, setHistoryHasNextPage] = useState<boolean>(false);
  const [historyHasPreviousPage, setHistoryHasPreviousPage] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchSalesSummaryAndBankInformation = async () => {
    setError(null);
    try {
      const [salesSummaryResponse, bankInformationResponse] = await Promise.all([
        getCreatorsSalesSummary(),
        getUserBankDefaultInformation(),
      ]);
      if (bankInformationResponse.status !== 200 || salesSummaryResponse.status !== 200) {
        throw new Error('Failed to fetch sales summary or bank information');
      }
      setAvailableAmount(salesSummaryResponse.data.withdrawable_amount);
      // Mock TODO delete bellow and use above instead
      // setAvailableAmount(100000);
      setBankAccount(bankInformationResponse.data.user_bank);

    } catch (error) {
      console.error('Error fetching sales summary:', error);
      setError('データの取得に失敗しました。再度お試しください。');
    }
  };

  useEffect(() => {
    fetchWithdrawalHistories(historyPage);
  }, [historyPage]);

  useEffect(() => {
    if (bankAccount && availableAmount > 0 && withdrawalAmount >= 2000 && withdrawalAmount <= availableAmount) {
      setIsSubmitDisabled(false);
    } else {
      setIsSubmitDisabled(true);
    }
  }, [bankAccount, availableAmount, withdrawalAmount]);

  useEffect(() => {
    fetchSalesSummaryAndBankInformation();
  }, []);

  const handleBankAccountChange = () => {
    navigate('/account/settings/bank-account');
  };

  const handleWithdrawalAmountChange = (amount: number) => {
    if (amount < 2000) {
      setWithdrawalNotice('出金最低額は2,000円です');
      setWithdrawalAmount(amount);
      setTransferAmount(amount - 330);
      setIsSubmitDisabled(true);
    } else if (amount > availableAmount) {
      setWithdrawalNotice('売上金より大きい金額は入力できません');
      setWithdrawalAmount(availableAmount);
      setTransferAmount(availableAmount - 330);
      setIsSubmitDisabled(true);
    } else {
      setWithdrawalAmount(amount);
      setTransferAmount(amount - 330);
      setWithdrawalNotice('');
      setIsSubmitDisabled(false);
    }
  };

  const fetchWithdrawalHistories = async (page: number) => {
    try {
      const response = await getWithdrawalHistories(page);
      if (response.status !== 200) {
        throw new Error('Failed to fetch withdrawal histories');
      }
      setWithdrawalHistories(response.data.withdrawal_applications);
      setHistoryTotalPage(response.data.total_pages);
      setHistoryHasNextPage(response.data.has_next);
      setHistoryHasPreviousPage(response.data.has_previous);
    } catch (error) {
      console.error('Error fetching withdrawal histories:', error);
      setHistoryError('履歴の取得に失敗しました。再度お試しください。');
    }
  };

  const handlePageChange = (page: number) => {
    setHistoryPage(page);
  };

  const handleWithdrawalApplicationSubmit = async () => {
    if (isSubmitDisabled) {
      return;
    }
    try {
      setIsSubmitDisabled(true);
      setError(null);
      const request: WithdrawalApplicationRequest = {
        withdraw_amount: withdrawalAmount,
        transfer_amount: transferAmount,
        user_bank_id: bankAccount?.id.toString() || '',
      };
      const response = await submitWithdrawalApplication(request);
      if (response.status !== 200) {
        throw new Error('Failed to submit withdrawal application');
      }
      // アカウント画面に遷移
      navigate('/account')
    } catch (error) {
      console.error('Error submitting withdrawal application:', error);
      if ((error as AxiosError).response?.status === 400) {
        setError("未完了申請があり、または申請回数の制限を超えています。時間をおいて再度お試しください。");
      } else {
        setError('出金申請に失敗しました。再度Ïお試しください。');
      }
    } finally {
      setIsSubmitDisabled(false);
    }
  };

  return (
    <div className="bg-white">
      <AccountHeader title="売上金の出金申請" showBackButton />
      <div className="p-6 space-y-6 mt-16">
        {error && <ErrorMessage message={[error]} variant="error" />}
        <div className="flex items-center justify-between">
          <p className="text-md font-bold text-gray-900 px-2">売上金の出金申請</p>
          <Button variant="withdrawal" size="sm" disabled={isSubmitDisabled} onClick={handleWithdrawalApplicationSubmit}>
            申請
          </Button>
        </div>

        {/* Withdrawal Balance Section */}
        <WithdrawalBalanceSection availableAmount={availableAmount} />

        {/* Withdrawal Application Section */}
        <WithdrawalApplicationSection
          withdrawalAmount={withdrawalAmount}
          withdrawalFee={330}
          handleWithdrawalAmountChange={handleWithdrawalAmountChange}
          withdrawalNotice={withdrawalNotice}
          transferAmount={transferAmount}
        />

        {/* Bank Account Section */}
        <BankAccountSection
          bankAccount={bankAccount}
          handleBankAccountChange={handleBankAccountChange}
        />

        {/* Withdrawal History Section */}
        <WithdrawalHistorySection
          withdrawalHistories={withdrawalHistories}
          historyPage={historyPage}
          historyTotalPage={historyTotalPage}
          historyHasNextPage={historyHasNextPage}
          historyHasPreviousPage={historyHasPreviousPage}
          onPageChange={handlePageChange}
          historyError={historyError}
        />
      </div>
    </div>
  );
}

