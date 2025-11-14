import React from 'react';

interface WithdrawalHistory {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

interface WithdrawalHistorySectionProps {
  withdrawalHistory: WithdrawalHistory[];
}

export default function WithdrawalHistorySection({
  withdrawalHistory,
}: WithdrawalHistorySectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">過去履歴</h3>
      </div>
      <div className="p-6">
        {withdrawalHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">履歴がありません</div>
        ) : (
          <div className="space-y-3">
            {withdrawalHistory.map((history) => (
              <div
                key={history.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="text-sm text-gray-600">{history.date}</div>
                  <div className="font-medium text-gray-900">
                    ¥{history.amount.toLocaleString()}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    history.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : history.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {history.status === 'completed'
                    ? '完了'
                    : history.status === 'pending'
                      ? '処理中'
                      : '失敗'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
