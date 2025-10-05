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
  showAllFilter = false
}: PostFilterBarProps) {
  const sortLabels: Record<SortType, string> = {
    newest: '新しい',
    oldest: '古い',
    popular: '人気'
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange('image')}
          className={`p-2 rounded-full transition-colors ${
            activeFilter === 'image'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Image className="w-4 h-4" />
        </button>
        <button
          onClick={() => onFilterChange('video')}
          className={`p-2 rounded-full transition-colors ${
            activeFilter === 'video'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Video className="w-4 h-4" />
        </button>
      </div>

      {/* Sort Button */}
      <button
        onClick={() => {
          // TODO: ソートメニューを開く処理
        }}
        className="ml-auto flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded"
      >
        {sortLabels[sortBy]}
        <ArrowUpDown className="w-4 h-4" />
      </button>

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
