import React, { useEffect, useState } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';
import { Link, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '@/components/common';
import { useAuth } from '@/providers/AuthContext';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getPaymentHistories as getPaymentHistoriesAPI } from '@/api/endpoints/payment_histories';
import { PaymentHistory } from '@/api/types/payment_histories';
import { currencyFormat } from '@/utils/currencyFormat';

const PAYMENT_TYPE = {
  SINGLE: 1,
  PLAN: 2,
  CHIP: 3,
} as const;

export default function PaymentHistories() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [period, setPeriod] = useState('today');
  const [error, setError] = useState({ show: false, messages: [] });
  const [paymentHistories, setPaymentHistories] = useState<PaymentHistory[]>([]);

  const periodOptions = React.useMemo(() => {
    const options = [
      { value: 'today', label: '今日' },
      { value: 'yesterday', label: '昨日' },
      { value: 'day_before_yesterday', label: '一昨日' },
    ];
    const now = new Date();
    const signup = new Date(convertDatetimeToLocalTimezone(user?.user_created_at || ''));

    const startYear = signup.getFullYear();
    const startMonth = signup.getMonth();
    const endYear = now.getFullYear();
    const endMonth = now.getMonth();

    const startIndex = startYear * 12 + startMonth;
    const endIndex = endYear * 12 + endMonth;

    for (let idx = endIndex; idx >= startIndex; idx--) {
      const year = Math.floor(idx / 12);
      const month0 = idx % 12;
      const month = month0 + 1;

      const value = `${year}-${String(month).padStart(2, '0')}`;
      const label = `${year}/${month}`;

      options.push({ value, label });
    }

    return options;
  }, [user]);

  const renderStatusBadge = (status: number) => {
    // PENDING = 1 # 保留
    // SUCCEEDED = 2 # 成功
    // FAILED = 3 # 失敗
    // REFUNDED = 4 # 返金
    // PARTIALLY_REFUNDED = 5 # 一部返金
    switch (status) {
      case 1:
        return (
          <Badge variant="outline" className="bg-yellow-500 text-white">
            処理中
          </Badge>
        );
      case 2:
        return (
          <Badge variant="outline" className="bg-blue-500 text-white">
            成功
          </Badge>
        );
      case 3:
        return (
          <Badge variant="outline" className="bg-red-500 text-white">
            失敗
          </Badge>
        );
      case 4:
        return (
          <Badge variant="outline" className="bg-green-500 text-white">
            返金
          </Badge>
        );
      case 5:
        return (
          <Badge variant="outline" className="bg-gray-500 text-white">
            一部返金
          </Badge>
        );
    }
  };

  const renderPaymentType = (paymentType: number) => {
    switch (paymentType) {
      case PAYMENT_TYPE.SINGLE:
        return (
          <Badge variant="outline" className="bg-[#3B82F6] text-white">
            単品
          </Badge>
        );
      case PAYMENT_TYPE.PLAN:
        return (
          <Badge variant="outline" className="bg-[#10B981] text-white">
            プラン
          </Badge>
        );
      case PAYMENT_TYPE.CHIP:
        return (
          <Badge variant="outline" className="bg-[#F59E0B] text-white">
            チップ
          </Badge>
        );
    }
  };

  const getPaymentHistories = async (page: number, period: string) => {
    setError({ show: false, messages: [] });
    try {
      const response = await getPaymentHistoriesAPI(page, 20, period);
      setPaymentHistories(response.data.payments as PaymentHistory[]);
      setTotalPages(response.data.total_pages);
      setHasNext(response.data.has_next);
      setHasPrevious(response.data.has_previous);
    } catch (error) {
      console.error('Payment histories error', error);
      setError({ show: true, messages: ['決済履歴の取得に失敗しました'] });
    }
  };

  useEffect(() => {
    getPaymentHistories(page, period);
  }, [page, period]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleChipRowClick = (conversation_id: string) => {
    // チップの場合、相手とのメッセージ会話ページに遷移
    navigate(`/message/conversation/${conversation_id}`);
  };

  const hasPagination = totalPages > 1;

  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader
        title="決済履歴"
        showBackButton={true}
        onBack={() => navigate('/account/settings')}
      />
      <div className="px-6 space-y-6 mt-16">
        <div className="flex items-center justify-between mb-6">
          <p className="text-lg font-semibold text-gray-900">決済履歴</p>
          <div className="relative">
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="期間を選択" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {error.show && <ErrorMessage message={error.messages} />}
        <div className="flex items-center justify-between mb-6 overflow-x-auto">
          {paymentHistories.length > 0 ? (
            <Table className="min-w-[480px]">
              <TableHeader className="bg-[#333333] hover:bg-[#333333]">
                <TableRow className="bg-[#333333] hover:bg-[#333333]">
                  <TableHead className="min-w-[96px] border-r border-gray-200 text-xs font-medium text-white text-center">
                    ステータス
                  </TableHead>
                  <TableHead className="border-r border-gray-200 text-xs font-medium text-white text-center">
                    金額
                  </TableHead>
                  <TableHead className="border-r border-gray-200 text-xs font-medium text-white text-center">
                    種別
                  </TableHead>
                  <TableHead className="border-r border-gray-200 text-xs font-medium text-white text-center">
                    タイトル
                  </TableHead>
                  <TableHead className="border-r border-gray-200 text-xs font-medium text-white text-left">
                    日付
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistories.map((paymentHistory) => (
                  <TableRow key={paymentHistory.id}>
                    <TableCell className="text-center border-r border-gray-200">
                      {renderStatusBadge(paymentHistory.payment_status as number)}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200">
                      {currencyFormat(paymentHistory.payment_amount)}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200">
                      {/* <span
                                                    className={
                                                        paymentHistory.payment_type === 2
                                                            ? 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white bg-[#3B82F6]'
                                                            : 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white bg-[#10B981]'
                                                    }
                                                >
                                                    {paymentHistory.payment_type === 1 ? '単品' : 'プラン'}
                                                </span> */}
                      {renderPaymentType(paymentHistory.payment_type as number)}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200">
                      {paymentHistory.payment_type === PAYMENT_TYPE.PLAN ? (
                        <Link
                          to={`/plan/${paymentHistory.plan_id}`}
                          className="block max-w-[200px] truncate text-xs text-gray-700 underline"
                          title="プラン詳細を見る"
                        >
                          プラン詳細を見る
                        </Link>
                      ) : paymentHistory.payment_type === PAYMENT_TYPE.CHIP ? (
                        <button
                          onClick={() =>
                            paymentHistory.conversation_id &&
                            handleChipRowClick(paymentHistory.conversation_id)
                          }
                          className="block max-w-[200px] truncate text-xs text-gray-700 underline cursor-pointer"
                          title="トークルームを開く"
                          disabled={!paymentHistory.conversation_id}
                        >
                          トークルームを開く
                        </button>
                      ) : (
                        <Link
                          to={`/post/detail?post_id=${paymentHistory.single_post_id}`}
                          className="block max-w-[200px] truncate text-xs text-gray-700 underline"
                          title="投稿詳細を見る"
                        >
                          投稿詳細を見る
                        </Link>
                      )}
                    </TableCell>
                    <TableCell className="text-left">
                      {convertDatetimeToLocalTimezone(paymentHistory.paid_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center w-full">
              <p className="text-gray-500">決済履歴がありません</p>
            </div>
          )}
        </div>
        {/* Pagination */}
        {hasPagination && (
          <div className="flex items-center justify-center px-4 py-3 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => hasPrevious && handlePageChange(page - 1)}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-xs text-gray-500 mx-2">
              {page} / {totalPages} ページ
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => hasNext && handlePageChange(page + 1)}
              disabled={!hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
