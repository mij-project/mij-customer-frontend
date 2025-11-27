import React from 'react';
import { TabItem } from '../types';

interface FilterSectionProps {
  tabItems: TabItem[];
  timePeriodTabs: TabItem[];
  onTabClick: (tabId: string) => void;
  onTimePeriodClick: (periodId: string) => void;
}

export default function FilterSection({
  tabItems,
  timePeriodTabs,
  onTabClick,
  onTimePeriodClick,
}: FilterSectionProps) {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-screen-md mx-auto">
        {/* カテゴリーフィルタータブ（投稿 / クリエイター） - セグメントコントロール */}
        <div className="flex justify-center px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex bg-gray-100 rounded-full p-1.5 gap-2 w-full max-w-lg">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                className={`flex-1 px-6 py-2 text-sm font-semibold rounded-full transition-all ${
                  tab.isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* メインセクションタブ（ランキング / 期間限定） */}
        <div className="border-b border-gray-200">
          <div className="flex justify-evenly px-4 sm:px-6 lg:px-8 pt-4 pb-3">
            {timePeriodTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTimePeriodClick(tab.id)}
                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  tab.isActive ? 'text-gray-900' : 'text-gray-900 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
