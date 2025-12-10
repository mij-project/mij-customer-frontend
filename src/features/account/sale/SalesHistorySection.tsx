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
              <TableHead className="text-xs font-medium text-white">日時</TableHead>
              <TableHead className="text-xs font-medium text-white">種類</TableHead>
              <TableHead className="text-xs font-medium text-white">タイトル</TableHead>
              <TableHead className="text-xs font-medium text-white">売上金額</TableHead>
              <TableHead className="text-xs font-medium text-white">ユーザー</TableHead>
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
                  <TableCell className="text-xs">
                    <span
                      className={
                        saleHistory.payment_type === 2
                          ? 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white bg-[#3B82F6]'
                          : 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white bg-[#10B981]'
                      }
                    >
                      {saleHistory.payment_type === 1 ? '単品' : 'プラン'}
                    </span>
                  </TableCell>

                  {/* タイトル + tooltip (native) */}
                  <TableCell className="text-xs text-gray-700">
                    {saleHistory.payment_type === 2 ? (
                      <Link
                        to={`/plan/detail?plan_id=${saleHistory.plan_id}`}
                        className="block max-w-[200px] truncate text-xs text-gray-700 underline"
                        title="プラン詳細を見る"
                      >
                        プラン詳細を見る
                      </Link>
                    ) : (
                      <Link
                        to={`/post/detail?post_id=${saleHistory.single_post_id}`}
                        className="block max-w-[200px] truncate text-xs text-gray-700 underline"
                        title="投稿詳細を見る"
                      >
                        投稿詳細を見る
                      </Link>
                    )}
                  </TableCell>

                  {/* 売上金額 */}
                  <TableCell className="text-xs text-gray-700">
                    {currencyFormat(saleHistory.payment_price)}
                  </TableCell>

                  {/* ユーザー + tooltip + truncate */}
                  <TableCell className="text-xs text-gray-700">
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
