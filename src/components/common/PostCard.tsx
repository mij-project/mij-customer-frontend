import React from 'react';
import { Play, Clock, Crown, Image as ImageIcon, Diamond } from 'lucide-react';
import LikeButton from '@/components/social/LikeButton';
import BookmarkButton from '@/components/social/BookmarkButton';

const NO_IMAGE_URL = '/assets/no-image.svg';

export interface PostCardProps {
  id: string;
  post_type: number;

  // サムネイルとメディア情報
  thumbnail_url?: string;
  thumbnail?: string; // 後方互換性のため
  description?: string;
  title?: string; // 後方互換性のため
  video_duration?: number;
  duration?: string; // 後方互換性のため（文字列形式）

  // 価格と日付
  price?: number;
  currency?: string;
  created_at?: string;

  // 表示オプション
  variant?: 'simple' | 'detailed'; // simple: ProfilePostCard風、detailed: 既存PostCard風（デフォルト）
  showTitle?: boolean; // タイトル/説明文を表示（variant="simple"の場合のみ有効）
  showCreatorInfo?: boolean; // クリエイター情報を表示（デフォルト: variant="detailed"の場合true）
  showRank?: boolean; // ランクバッジを表示
  showStats?: boolean; // いいね・ブックマークボタンを表示（デフォルト: variant="detailed"の場合true）
  showPrice?: boolean; // 価格を表示（デフォルト: priceがある場合true）
  showDate?: boolean; // 日付を表示（デフォルト: false）

  // クリエイター・ランク・統計情報
  creator?: {
    name: string;
    username: string;
    avatar?: string;
    verified: boolean;
  };
  rank?: number;
  likes?: number;
  views?: number;

  // コールバック
  onClick?: (postId: string) => void;
  onCreatorClick?: (username: string) => void;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getRankColor = (rank?: number) => {
  if (!rank) return { text: 'text-primary', fill: 'fill-primary' };
  if (rank === 1) return { text: 'text-yellow-500', fill: 'fill-yellow-500' }; // 金色
  if (rank === 2) return { text: 'text-gray-400', fill: 'fill-gray-400' }; // 銀色
  if (rank === 3) return { text: 'text-orange-600', fill: 'fill-orange-600' }; // 銅色
  return { text: 'text-primary', fill: 'fill-primary' };
};

export default function PostCard({
  id,
  post_type,
  thumbnail_url,
  thumbnail,
  description,
  title,
  video_duration,
  duration,
  price,
  currency = 'JPY',
  created_at,
  variant = 'detailed',
  showTitle: showTitleProp,
  showCreatorInfo: showCreatorInfoProp,
  showRank = false,
  showStats: showStatsProp,
  showPrice: showPriceProp,
  showDate = false,
  creator,
  rank,
  likes = 0,
  views = 0,
  onClick,
  onCreatorClick,
}: PostCardProps) {
  // 表示オプションのデフォルト値を設定
  const isSimpleVariant = variant === 'simple';
  const showCreatorInfo = showCreatorInfoProp ?? !isSimpleVariant;
  const showStats = showStatsProp ?? !isSimpleVariant;
  const showTitle = showTitleProp ?? false;
  const showPriceFlag = showPriceProp ?? (price !== undefined && price !== null);

  // サムネイルURLの決定（後方互換性）
  const thumbnailUrl = thumbnail_url || thumbnail || NO_IMAGE_URL;

  // タイトル/説明文の決定（後方互換性）
  const displayText = description || title || '';

  // 動画時間の決定（後方互換性）
  const displayDuration = video_duration ? formatDuration(video_duration) : duration || '00:00';

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCreatorClick && creator) {
      onCreatorClick(creator.username);
    }
  };

  // Simple variant (ProfilePostCard風)
  if (isSimpleVariant) {
    return (
      <div
        className={`bg-white ${showTitle ? 'rounded-lg' : 'border border-gray-200 rounded-lg'} overflow-hidden cursor-pointer ${
          showTitle ? 'hover:shadow-md' : 'hover:opacity-80'
        } transition-all`}
        onClick={handleClick}
      >
        <div className="relative">
          <img
            src={thumbnailUrl}
            alt={displayText || '投稿画像'}
            className="w-full aspect-square object-cover"
            onError={(e) => {
              e.currentTarget.src = NO_IMAGE_URL;
            }}
          />

          {/* 価格バッジ（左下） */}
          {showPriceFlag && (
            <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center">
              ¥{price!.toLocaleString()}
            </div>
          )}

          {/* 動画尺表示（右下） or 画像アイコン */}
          {post_type === 1 && video_duration ? (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {displayDuration}
            </div>
          ) : post_type === 2 ? (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          ) : null}
        </div>

        {/* タイトルと日時（showTitleがtrueの場合のみ） */}
        {showTitle && (
          <div className="p-2">
            <p className="text-xs text-gray-900 line-clamp-2 mb-1 font-bold">
              {displayText || 'タイトルなし'}
            </p>
            {showDate && created_at && (
              <p className="text-xs text-gray-500">
                {new Date(created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Detailed variant (既存PostCard風)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative cursor-pointer" onClick={handleClick}>
        <img
          src={thumbnailUrl}
          alt={displayText}
          className="w-full aspect-square object-cover"
          onError={(e) => {
            e.currentTarget.src = NO_IMAGE_URL;
          }}
        />

        {/* 価格バッジ（左下） */}
        {showPriceFlag && (
          <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center">
            ¥{price!.toLocaleString()}
          </div>
        )}

        {/* Duration Badge */}
        <div
          className={`absolute bottom-2 ${showPriceFlag ? 'right-2' : 'right-2'} bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center`}
        >
          {post_type === 2 && <ImageIcon className="h-3 w-3" />}
          {post_type === 1 && displayDuration}
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
          <Play className="h-12 w-12 text-white" />
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start gap-2 mb-2 h-10">
          {showRank &&
            rank &&
            (() => {
              if (rank <= 6) {
                const rankColor = getRankColor(rank);
                return (
                  <div className="relative flex items-center justify-center">
                    <Crown className={`h-6s w-6 ${rankColor.text} ${rankColor.fill}`} />
                    <span className="absolute text-[12px] font-bold text-white leading-none">
                      {rank}
                    </span>
                  </div>
                );
              } else {
                return (
                  <div className="relative flex items-center justify-center">
                    <Diamond className="h-6s w-6 text-gray-200" />
                    <span className="absolute text-[12px] font-bold text-gray-500 leading-none">
                      {rank}
                    </span>
                  </div>
                );
              }
            })()}
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 flex-1">{displayText}</h3>
        </div>

        {/* Creator Info */}
        {showCreatorInfo && creator && (
          <div className="flex items-center space-x-2 mb-1">
            <img
              src={creator.avatar || NO_IMAGE_URL}
              alt={creator.name}
              className="w-6 h-6 rounded-full cursor-pointer"
              onClick={handleCreatorClick}
            />
            <span
              className="text-xs text-gray-600 flex items-center cursor-pointer"
              onClick={handleCreatorClick}
            >
              {creator.name}
              {creator.verified && <span className="text-yellow-500 ml-1">★</span>}
            </span>
          </div>
        )}

        {/* Stats and Actions */}
        {showStats && (
          <div className="flex items-center justify-start gap-3 text-xs text-gray-500">
            <LikeButton postId={id} initialCount={likes} />
            <BookmarkButton postId={id} className="h-6" />
          </div>
        )}

        {/* Date */}
        {showDate && created_at && !showStats && (
          <p className="text-xs text-gray-500 mt-1">
            {new Date(created_at).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
