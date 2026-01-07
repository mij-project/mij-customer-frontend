import React from 'react';
import { ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/providers/AuthContext';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TodaySalesSectionProps {
  periodSales: number;
  singleItemSales: number;
  planSales: number;
  chipSales: number;
  previousPeriodSales: number;
  period: string;
  onPeriodChange: (period: string) => void;
  loading: boolean;
  errorMessage: string;
}

type PeriodOption = {
  value: string;
  label: string;
};

export default function GraphicalSalesSection({
  chipSales,
  periodSales,
  singleItemSales,
  planSales,
  period,
  onPeriodChange,
  previousPeriodSales,
  loading,
  errorMessage,
}: TodaySalesSectionProps) {
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-6 text-card-foreground shadow-sm bg-black/3 py-5 justify-center items-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }
  if (errorMessage) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-6 text-card-foreground shadow-sm bg-black/3 py-5 justify-center items-center">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }

  const periodOptions: PeriodOption[] = React.useMemo(() => {
    const options: PeriodOption[] = [
      { value: 'today', label: '今日' },
      { value: 'yesterday', label: '昨日' },
      { value: 'day_before_yesterday', label: '一昨日' },
    ];
    const now = new Date();
    const signup = new Date(convertDatetimeToLocalTimezone(user?.user_updated_at || ''));

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

  const chartData = [
    { name: '単品売上', value: singleItemSales },
    { name: 'プラン売上', value: planSales },
    { name: 'チップ売上', value: chipSales },
  ];

  const COLORS = ['#3B82F6', '#1D4DA2', '#F59E0B'];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-6 text-card-foreground shadow-sm bg-black/3 py-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">売上金データ</h3>
        <div className="relative">
          <Select value={period} onValueChange={onPeriodChange}>
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

      {/* 円形チャート（PieChart） */}
      <div className="relative w-full max-w-xs mx-auto mb-6 flex items-center justify-center">
        <div className="w-[260px] h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* 背景のグレーリング（常に 1 周） */}
              <Pie
                data={[{ name: 'bg', value: 1 }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={105}
                outerRadius={120}
                startAngle={90}
                endAngle={-270}
                stroke="transparent"
                fill="#E5E7EB"
                isAnimationActive={false}
              />

              {/* 実際の売上データ（0→有値のときも transition する） */}
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={105}
                outerRadius={120}
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                isAnimationActive={true}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 中央テキスト */}
        <div className="absolute text-center">
          <div className="text-sm text-gray-600 mb-1">
            {periodOptions.find((option) => option.value === period)?.label}の売上
          </div>
          <div className="text-xs text-gray-400 mb-2">
            {periodOptions.find((option) => option.value === period)?.label}
          </div>
          <div className="text-2xl font-bold text-gray-900">¥{periodSales.toLocaleString()}</div>
          {['today', 'yesterday', 'day_before_yesterday'].includes(period) ? (
            <div className="text-xs text-blue-500 mt-2">
              → ¥{previousPeriodSales.toLocaleString()} (前日比)
            </div>
          ) : (
            <div className="text-xs text-blue-500 mt-2">
              → ¥{previousPeriodSales.toLocaleString()} (前月比)
            </div>
          )}
        </div>
      </div>

      {/* 期間合計売上 */}
      <div className="rounded-2xl border border-dashed border-[#3B82F6] px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-600">期間合計売上</span>
          <span className="text-lg font-bold text-gray-900">¥{periodSales.toLocaleString()}</span>
        </div>
      </div>

      {/* 売上内訳 */}
      <div className="grid grid-cols-1 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
            <span className="text-sm text-gray-600">単品売上</span>
          </div>
          <div className="text-xl font-bold text-gray-900">¥{singleItemSales.toLocaleString()}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#1D4DA2]" />
            <span className="text-sm text-gray-600">プラン売上</span>
          </div>
          <div className="text-xl font-bold text-gray-900">¥{planSales.toLocaleString()}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="text-sm text-gray-600">チップ売上</span>
          </div>
          <div className="text-xl font-bold text-gray-900">¥{chipSales.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
