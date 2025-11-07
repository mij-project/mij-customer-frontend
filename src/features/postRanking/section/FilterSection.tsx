import React from 'react';
import FilterTabs from '@/components/video/FilterTabs';
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
      <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FilterTabs tabs={tabItems} onTabClick={onTabClick} className="justify-center mb-4" />
        <FilterTabs
          tabs={timePeriodTabs}
          onTabClick={onTimePeriodClick}
          className="justify-center"
        />
      </div>
    </section>
  );
}
