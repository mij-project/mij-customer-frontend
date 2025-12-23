import React from 'react';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { SalesHistory } from '@/api/types/sales';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import { currencyFormat } from '@/utils/currencyFormat';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SalesHistorySectionProps {
  saleHistories: SalesHistory[];
  loading: boolean;
  errorMessage: string;
  hasNext: boolean;
  hasPrevious: boolean;
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
}

const PAYMENT_TYPE = {
  SINGLE: 1,
  PLAN: 2,
  CHIP: 3,
} as const;

const PAYMENT_TYPE_LABELS: Record<number, string> = {
  [PAYMENT_TYPE.SINGLE]: '単品',
  [PAYMENT_TYPE.PLAN]: 'プラン',
  [PAYMENT_TYPE.CHIP]: 'チップ',
} as const;

const PAYMENT_TYPE_COLORS: Record<number, string> = {
  [PAYMENT_TYPE.SINGLE]: 'bg-[#3B82F6]',
  [PAYMENT_TYPE.PLAN]: 'bg-[#10B981]',
  [PAYMENT_TYPE.CHIP]: 'bg-[#F59E0B]',
} as const;

function SalesHistorySectionBase({
  saleHistories,
  loading,
  errorMessage,
  hasNext,
  hasPrevious,
  totalPages,
  page,
  onPageChange,
}: SalesHistorySectionProps) {
  const hasSaleHistories = saleHistories.length > 0;

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-gray-500 text-sm">読み込み中...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-red-500 text-sm">{errorMessage}</p>
      </div>
    );
  }

  const hasPagination = totalPages > 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <p className="text-sm font-semibold text-gray-900">売上金の詳細</p>
      </div>

      {/* Table + horizontal scroll */}
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="bg-[#333333] hover:bg-[#333333]">
              <TableHead className="text-xs font-medium text-white text-left">日時</TableHead>
              <TableHead className="text-xs font-medium text-white text-center">種類</TableHead>
              <TableHead className="text-xs font-medium text-white text-center">タイトル</TableHead>
              <TableHead className="text-xs font-medium text-white text-center">売上金額</TableHead>
              <TableHead className="text-xs font-medium text-white text-center">ユーザー</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {hasSaleHistories ? (
              saleHistories.map((saleHistory) => (
                <TableRow key={saleHistory.id}>
                  {/* 日時 */}
                  <TableCell className="text-xs text-gray-700">
                    {convertDatetimeToLocalTimezone(saleHistory.paid_at)}
                  </TableCell>

                  {/* 種類 */}
                  <TableCell className="text-xs text-center">
                    <span
                      className={
                        `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white ${PAYMENT_TYPE_COLORS[saleHistory.payment_type]}`
                      }
                    >
                      {PAYMENT_TYPE_LABELS[saleHistory.payment_type]}
                    </span>
                  </TableCell>

                  {/* タイトル + tooltip (native) */}
                  <TableCell className="text-xs text-gray-700 flex items-center justify-center">
                    {saleHistory.payment_type === 2 ? (
                      // <Link
                      //   to={`/plan/${saleHistory.plan_id}`}
                      //   className="block max-w-[200px] truncate text-xs text-gray-700 underline text-center"
                      //   title="プラン詳細を見る"
                      // >
                      <span className="inline-block truncate whitespace-nowrap align-middle">
                        {saleHistory.plan_name || ''}
                      </span>
                      // </Link>
                    ) : (
                      <span className="inline-block truncate whitespace-nowrap align-middle">
                        {saleHistory.single_post_description || ''}
                      </span>
                    )}
                  </TableCell>

                  {/* 売上金額 */}
                  <TableCell className="text-xs text-gray-700 text-center">
                    {currencyFormat(saleHistory.payment_price)}
                  </TableCell>

                  {/* ユーザー + tooltip + truncate */}
                  <TableCell className="text-xs text-gray-700 text-center">
                    <Link
                      to={`/profile?username=${saleHistory.buyer_username}`}
                      className="block max-w-[160px] truncate text-xs text-gray-700 underline"
                      title={saleHistory.buyer_username} // tooltip native
                    >
                      {saleHistory.buyer_username}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 text-xs py-6"
                >
                  売上履歴がありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {hasPagination && (
        <div className="flex items-center justify-center px-4 py-3 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => hasPrevious && onPageChange(page - 1)}
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
            onClick={() => hasNext && onPageChange(page + 1)}
            disabled={!hasNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

const SalesHistorySection = React.memo(SalesHistorySectionBase);

export default SalesHistorySection;
