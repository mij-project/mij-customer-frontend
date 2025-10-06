import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

interface TodaySalesSectionProps {
  periodSales: number;
  singleItemSales: number;
  planSales: number;
  period: string;
  onPeriodChange: (period: string) => void;
}

export default function TodaySalesSection({
  periodSales,
  singleItemSales,
  planSales,
  period,
  onPeriodChange
}: TodaySalesSectionProps) {
  const periodLabels: Record<string, string> = {
    today: '今日',
    last_5_days: '5日前',
    monthly: '月間'
  };

  // 円グラフ用のデータ
  const chartData = [
    { name: '単品売上', value: singleItemSales },
    { name: 'プラン売上', value: planSales }
  ];

  const COLORS = ['#3b82f6', '#60a5fa']; // 青系の色

  // 今日の日付
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">売上データ</h3>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">今日</option>
            <option value="last_5_days">5日前</option>
            <option value="monthly">月間</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* 円グラフ */}
      <div className="relative w-full max-w-xs mx-auto mb-6">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* グラフ中央のテキスト */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-sm text-gray-600 mb-1">{periodLabels[period]}の売上</div>
          <div className="text-xs text-gray-400 mb-2">{today}</div>
          <div className="text-2xl font-bold text-gray-900">¥{periodSales.toLocaleString()}</div>
          <div className="text-xs text-blue-500 mt-2">→ ¥0 (前日比)</div>
        </div>
      </div>

      {/* 期間合計売上 */}
      <div className="border border-blue-200 rounded-lg p-4 mb-4 bg-blue-50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-600">期間合計売上</span>
          <span className="text-lg font-bold text-gray-900">¥{periodSales.toLocaleString()}</span>
        </div>
      </div>

      {/* 売上内訳 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">単品売上</span>
          </div>
          <div className="text-xl font-bold text-gray-900">¥{singleItemSales.toLocaleString()}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-sm text-gray-600">プラン売上</span>
          </div>
          <div className="text-xl font-bold text-gray-900">¥{planSales.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
} 