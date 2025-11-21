import React from 'react';
import { Image, Video, ArrowUpDown, ChevronDown } from 'lucide-react';

type FilterType = 'all' | 'image' | 'video';
type SortType = 'newest' | 'oldest' | 'popular';

interface PostFilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy?: SortType;
  onSortChange?: (sort: SortType) => void;
  showAllFilter?: boolean;
}

export default function PostFilterBar({
  activeFilter,
  onFilterChange,
  sortBy = 'newest',
  onSortChange,
  showAllFilter = false,
}: PostFilterBarProps) {
  const sortLabels: Record<SortType, string> = {
    newest: '新しい',
    oldest: '古い',
    popular: '人気',
  };

  return (
    <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
      {/* Filter Tabs - Segment Button Style */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 w-full">
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
          className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center ${
            activeFilter === 'video'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Image className="w-4 h-4" />
        </button>
        <button
          onClick={() => onFilterChange('image')}
          className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center ${
            activeFilter === 'image'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Video className="w-4 h-4" />
        </button>
      </div>

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

      {/* "すべて" dropdown (for bought posts page) */}
      {showAllFilter && (
        <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-300">
          すべて
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
