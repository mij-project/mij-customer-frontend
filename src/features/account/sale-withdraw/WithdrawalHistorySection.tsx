import React from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import convertDatetimeToLocalTimezone from "@/utils/convertDatetimeToLocalTimezone";
import { currencyFormat } from "@/utils/currencyFormat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WithdrawalHistorySectionProps {
  withdrawalHistories: any[];
  historyPage: number;
  historyTotalPage: number;
  historyHasNextPage: boolean;
  historyHasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  historyError: string | null;
}

export default function WithdrawalHistorySection({
  withdrawalHistories,
  historyPage,
  historyTotalPage,
  historyHasNextPage,
  historyHasPreviousPage,
  onPageChange,
  historyError,
}: WithdrawalHistorySectionProps) {

  const renderStatusBadge = (status: number) => {
    // 1=pending, 2=processing, 3=completed, 4=failed, 5=cancelled
    switch (status) {
      case 1:
        return <Badge variant="outline" className="bg-yellow-500 text-white">未処理</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-blue-500 text-white">処理中</Badge>;
      case 3:
        return <Badge variant="outline" className="bg-green-500 text-white">完了</Badge>;
      case 4:
        return <Badge variant="outline" className="bg-red-500 text-white">失敗</Badge>;
      case 5:
        return <Badge variant="outline" className="bg-gray-500 text-white">キャンセル</Badge>;
    }
  };

  if (historyError) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">過去履歴</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-red-500">{historyError}</div>
        </div>
      </div>
    );
  }

  const hasData = withdrawalHistories && withdrawalHistories.length > 0;
  const hasPagination = historyTotalPage > 1;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">過去履歴</h3>
      </div>

      <div className="space-y-6">
        {!hasData ? (
          <div className="text-center py-8 text-gray-500">履歴がありません</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-[#333333] hover:bg-[#333333]">
                    <TableHead className="text-xs font-medium text-white">申請日時</TableHead>
                    <TableHead className="text-xs text-center font-medium text-white">申請金額</TableHead>
                    <TableHead className="text-xs text-center font-medium text-white">振込金額</TableHead>
                    <TableHead className="text-xs text-center font-medium text-white">ステータス</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {withdrawalHistories.map((withdrawalHistory) => (
                    <TableRow key={withdrawalHistory.id}>
                      <TableCell>{convertDatetimeToLocalTimezone(withdrawalHistory.requested_at)}</TableCell>
                      <TableCell className="text-center">
                        {currencyFormat(withdrawalHistory.withdraw_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {currencyFormat(withdrawalHistory.transfer_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderStatusBadge(withdrawalHistory.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {hasPagination && (
              <div className="flex items-center justify-center px-4 py-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => historyHasPreviousPage && onPageChange(historyPage - 1)}
                  disabled={!historyHasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-xs text-gray-500 mx-2">
                  {historyPage} / {historyTotalPage} ページ
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => historyHasNextPage && onPageChange(historyPage + 1)}
                  disabled={!historyHasNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
