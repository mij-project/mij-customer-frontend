import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface SalesTransaction {
  id: string;
  date: string;
  type: 'single' | 'plan';
  title: string;
  amount: number;
  buyer: string;
}

interface SalesHistorySectionProps {
  transactions: SalesTransaction[];
}

export default function SalesHistorySection({ transactions }: SalesHistorySectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">売上履歴</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
      </div>
      <div className="p-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">売上履歴がありません</div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{transaction.date}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        transaction.type === 'single'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {transaction.type === 'single' ? '単品' : 'プラン'}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{transaction.title}</div>
                  <div className="text-xs text-gray-500">購入者: {transaction.buyer}</div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ¥{transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
