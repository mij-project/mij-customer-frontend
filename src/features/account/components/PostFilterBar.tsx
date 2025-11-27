import React, { useState, useRef, useEffect } from 'react';
import { Image, Video, ArrowUpDown, ChevronDown, Menu } from 'lucide-react';

type FilterType = 'all' | 'image' | 'video';
type SortType = 'newest' | 'oldest' | 'popular';
type PlanFilterType = 'all' | 'plan' | 'single';

interface PostFilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy?: SortType;
  onSortChange?: (sort: SortType) => void;
  showAllFilter?: boolean;
  planFilter?: PlanFilterType;
  onPlanFilterChange?: (filter: PlanFilterType) => void;
}

export default function PostFilterBar({
  activeFilter,
  onFilterChange,
  sortBy = 'newest',
  onSortChange,
  showAllFilter = false,
  planFilter = 'all',
  onPlanFilterChange,
}: PostFilterBarProps) {
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortLabels: Record<SortType, string> = {
    newest: '新しい',
    oldest: '古い',
    popular: '人気',
  };

  const planFilterLabels: Record<PlanFilterType, string> = {
    all: 'すべて',
    plan: 'プラン',
    single: '単品販売',
  };

  // クリックアウトサイドでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPlanDropdown(false);
      }
    };

    if (showPlanDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlanDropdown]);

  return (
    <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white gap-3">
      {/* Filter Tabs - Segment Button Style */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 flex-1">
        <button
          onClick={() => onFilterChange('all')}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap text-center ${
            activeFilter === 'all'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange('video')}
          className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center whitespace-nowrap ${
            activeFilter === 'video'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Video className="w-4 h-4" />
        </button>
        <button
          onClick={() => onFilterChange('image')}
          className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center whitespace-nowrap ${
            activeFilter === 'image'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Image className="w-4 h-4" />
        </button>
      </div>
      
      {/* "プラン" dropdown (for bought posts page) */}
      {showAllFilter && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowPlanDropdown(!showPlanDropdown)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm whitespace-nowrap rounded border transition-all ${
              planFilter === 'plan'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="whitespace-nowrap">{planFilterLabels[planFilter]}</span>
            <Menu className="w-6 h-6" />
          </button>

          {showPlanDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
              {(['all', 'plan', 'single'] as PlanFilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    onPlanFilterChange?.(filter);
                    setShowPlanDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-sm text-left whitespace-nowrap transition-colors ${
                    planFilter === filter
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {planFilterLabels[filter]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sort Button */}
      {/* <button
        onClick={() => {
          // TODO: ソートメニューを開く処理
        }}
        className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded"
      >
        {sortLabels[sortBy]}
        <ArrowUpDown className="w-4 h-4" />
      </button> */}
    </div>
  );
}
