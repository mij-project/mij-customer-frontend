import React, { useState } from 'react';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Search as SearchIcon, Filter, X, Clock, TrendingUp, User, Hash } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'hashtag';
  title: string;
  subtitle?: string;
  thumbnail?: string;
  avatar?: string;
  followerCount?: number;
  likeCount?: number;
  isVerified?: boolean;
}

const mockRecentSearches = ['コスプレ', '料理動画', 'ダンス', 'アニメ'];

const mockTrendingTags = [
  { tag: 'グルメ', count: '12.5K' },
  { tag: 'ファッション', count: '8.3K' },
  { tag: 'ゲーム', count: '6.7K' },
  { tag: 'ペット', count: '4.9K' },
];

const mockPopularUsers = [
  {
    id: '1',
    type: 'user' as const,
    title: '田中美咲',
    subtitle: '@tanaka_misaki',
    avatar: '/assets/no-image.svg',
    followerCount: 15200,
    isVerified: true,
  },
  {
    id: '2',
    type: 'user' as const,
    title: '佐藤健太',
    subtitle: '@sato_kenta',
    avatar: '/assets/no-image.svg',
    followerCount: 8900,
    isVerified: false,
  },
];

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'user',
    title: '山田花子',
    subtitle: '@yamada_hanako',
    avatar: '/assets/no-image.svg',
    followerCount: 25000,
    isVerified: true,
  },
  {
    id: '2',
    type: 'post',
    title: '今日のコーデ紹介🌸',
    subtitle: '春らしいピンクのワンピースでお出かけ',
    thumbnail: '/assets/no-image.svg',
    likeCount: 342,
  },
  {
    id: '3',
    type: 'hashtag',
    title: '#春コーデ',
    subtitle: '1,234件の投稿',
  },
  {
    id: '4',
    type: 'user',
    title: '鈴木太郎',
    subtitle: '@suzuki_taro',
    avatar: '/assets/no-image.svg',
    followerCount: 12000,
    isVerified: false,
  },
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'users' | 'posts' | 'hashtags'>(
    'all'
  );
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // 実際のアプリでは、ここでAPIを呼び出してデータを取得
      setSearchResults([]); // 空の配列に変更
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const renderSearchResult = (result: SearchResult) => {
    switch (result.type) {
      case 'user':
        return (
          <div key={result.id} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer">
            <img
              src={result.avatar}
              alt={result.title}
              className="w-12 h-12 rounded-full object-cover mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">{result.title}</span>
                {result.isVerified && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center ml-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">{result.subtitle}</p>
              <p className="text-xs text-gray-400">
                {result.followerCount?.toLocaleString()}人のフォロワー
              </p>
            </div>
            <User className="h-5 w-5 text-gray-400" />
          </div>
        );

      case 'post':
        return (
          <div key={result.id} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer">
            <img
              src={result.thumbnail}
              alt={result.title}
              className="w-12 h-12 rounded-lg object-cover mr-3"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 line-clamp-1">{result.title}</p>
              <p className="text-sm text-gray-500 line-clamp-1">{result.subtitle}</p>
              <p className="text-xs text-gray-400">{result.likeCount} いいね</p>
            </div>
          </div>
        );

      case 'hashtag':
        return (
          <div key={result.id} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <Hash className="h-6 w-6 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{result.title}</p>
              <p className="text-sm text-gray-500">{result.subtitle}</p>
            </div>
            <Hash className="h-5 w-5 text-gray-400" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-md mx-auto pt-16 pb-20">
        {/* Search Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ユーザーや投稿を検索"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Search Categories */}
          {showResults && (
            <div className="flex space-x-2 mt-4">
              {[
                { key: 'all', label: 'すべて' },
                { key: 'users', label: 'ユーザー' },
                { key: 'posts', label: '投稿' },
                { key: 'hashtags', label: 'ハッシュタグ' },
              ].map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        {showResults ? (
          <div className="bg-white">
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">検索に一致するものが見つかりませんでした。</p>
            </div>
          </div>
        ) : (
          // Default Search Page Content
          <div className="space-y-6">
            {/* Recent Searches */}
            <div className="bg-white rounded-lg">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  最近の検索
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {mockRecentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trending Tags */}
            <div className="bg-white rounded-lg">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  トレンドタグ
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {mockTrendingTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(`#${tag.tag}`)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">#{tag.tag}</span>
                      <span className="text-sm text-gray-500">{tag.count} 投稿</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Users */}
            <div className="bg-white rounded-lg">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  人気クリエイター
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {mockPopularUsers.map(renderSearchResult)}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
