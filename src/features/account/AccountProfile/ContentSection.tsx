import React from 'react';
import { Star, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfilePlan } from '@/api/types/profile';
import PlanCard from './PlanCard';

interface Post {
  id: string;
  post_type: number; // 1: 動画, 2: 画像
  likes_count: number;
  description?: string;
  thumbnail_url?: string;
  video_duration?: number;
  price?: number;
  currency?: string;
  created_at: string;
}

interface Plan extends ProfilePlan {}

interface IndividualPurchase {
  id: string;
  likes_count: number;
  description?: string;
  thumbnail_url?: string;
  video_duration?: number;
  created_at: string;
  price?: number;
  currency?: string;
}

interface GachaItem {
  id: string;
  amount: number;
  created_at: string;
}

interface ContentSectionProps {
  activeTab: 'posts' | 'plans' | 'individual' | 'gacha' | 'videos' | 'images' | 'likes' | 'bookmarks';
  posts: Post[];
  plans: Plan[];
  individualPurchases: IndividualPurchase[];
  gachaItems: GachaItem[];
  likedPosts: any[];
  bookmarkedPosts: any[];
  likesLoading: boolean;
  bookmarksLoading: boolean;
  onPlanJoin: (plan: Plan) => void;
}

const NO_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEwMCAxMDBaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTRBRiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

export default function ContentSection({
  activeTab,
  posts,
  plans,
  individualPurchases,
  gachaItems,
  likedPosts,
  bookmarkedPosts,
  likesLoading,
  bookmarksLoading,
  onPlanJoin
}: ContentSectionProps) {
  const navigate = useNavigate();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const renderEmptyState = (type: string) => (
    <div className="p-6 text-center text-gray-500">
      {type}はありません。
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="relative">
                  <img
                    src={post.thumbnail_url || NO_IMAGE_URL}
                    alt={post.description || '投稿画像'}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.currentTarget.src = NO_IMAGE_URL;
                    }}
                  />
                  {/* 価格表示（単品購入の場合のみ） */}
                  {post.price !== undefined && post.price !== null && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center">
                      ¥{post.price.toLocaleString()}
                    </div>
                  )}
                  {/* 動画の場合は再生時間、画像の場合はアイコン */}
                  {post.post_type === 1 && post.video_duration ? (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(post.video_duration)}
                    </div>
                  ) : post.post_type === 2 ? (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Image className="w-4 h-4" />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('投稿');

      case 'videos':
        const videos = posts.filter(post => post.post_type === 1);
        return videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {videos.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="relative">
                  <img
                    src={post.thumbnail_url || NO_IMAGE_URL}
                    alt={post.description || '動画'}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.currentTarget.src = NO_IMAGE_URL;
                    }}
                  />
                  {/* 価格表示（単品購入の場合のみ） */}
                  {post.price !== undefined && post.price !== null && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center">
                      ¥{post.price.toLocaleString()}
                    </div>
                  )}
                  {/* 再生時間表示 */}
                  {post.video_duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(post.video_duration)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('動画');

      case 'images':
        const images = posts.filter(post => post.post_type === 2);
        return images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {images.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="relative">
                  <img
                    src={post.thumbnail_url || NO_IMAGE_URL}
                    alt={post.description || '画像'}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.currentTarget.src = NO_IMAGE_URL;
                    }}
                  />
                  {/* 価格表示（単品購入の場合のみ） */}
                  {post.price !== undefined && post.price !== null && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center">
                      ¥{post.price.toLocaleString()}
                    </div>
                  )}
                  {/* 画像アイコン表示 */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
                    <Image className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('画像');

      case 'plans':
        return plans.length > 0 ? (
          <div className="px-4 pb-24">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onJoin={onPlanJoin}
              />
            ))}
          </div>
        ) : renderEmptyState('プラン');

      case 'individual':
        return individualPurchases.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 pb-24">
            {individualPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handlePostClick(purchase.id)}
              >
                <div className="relative">
                  <img
                    src={purchase.thumbnail_url || NO_IMAGE_URL}
                    alt={purchase.description || '投稿画像'}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.currentTarget.src = NO_IMAGE_URL;
                    }}
                  />

                  {/* 価格バッジ（左下に黄色の円形） */}
                  {purchase.price !== undefined && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center">
                      ¥{purchase.price.toLocaleString()}
                    </div>
                  )}

                  {/* 動画尺表示（右下） */}
                  {purchase.video_duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(purchase.video_duration)}
                    </div>
                  )}
                </div>

                {/* タイトルと日時 */}
                <div className="p-2">
                  <p className="text-xs text-gray-900 line-clamp-2 mb-1">
                    {purchase.description || 'タイトルなし'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(purchase.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('単品購入');

      case 'gacha':
        return gachaItems.length > 0 ? (
          <div className="p-6 space-y-4 pb-24">
            {gachaItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img src={NO_IMAGE_URL} alt="ガチャアイテム" className="w-20 h-16 object-cover rounded" />
                    <Star className="absolute top-1 left-1 h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">ガチャアイテム</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm font-medium text-primary">¥{item.amount.toLocaleString()}</span>
                      <span className="text-sm text-gray-600">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('ガチャ');

      case 'likes':
        if (likesLoading) {
          return <div className="p-6 text-center text-gray-500 pb-24">読み込み中...</div>;
        }

        return likedPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {likedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="relative">
                  <img
                    src={post.thumbnail_url || NO_IMAGE_URL}
                    alt={post.description || 'いいねした投稿'}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.currentTarget.src = NO_IMAGE_URL;
                    }}
                  />
                  {/* 価格表示（単品購入の場合のみ） */}
                  {post.price !== undefined && post.price !== null && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center">
                      ¥{post.price.toLocaleString()}
                    </div>
                  )}
                  {/* 動画の場合は再生時間、画像の場合はアイコン */}
                  {post.post_type === 1 && post.video_duration ? (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(post.video_duration)}
                    </div>
                  ) : post.post_type === 2 ? (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Image className="w-4 h-4" />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('いいねした投稿');

      case 'bookmarks':
        if (bookmarksLoading) {
          return <div className="p-6 text-center text-gray-500 pb-24">読み込み中...</div>;
        }

        return bookmarkedPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {bookmarkedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="relative">
                  <img
                    src={post.thumbnail_url || NO_IMAGE_URL}
                    alt={post.description || '保存済み投稿'}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.currentTarget.src = NO_IMAGE_URL;
                    }}
                  />
                  {/* 価格表示（単品購入の場合のみ） */}
                  {post.price !== undefined && post.price !== null && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center">
                      ¥{post.price.toLocaleString()}
                    </div>
                  )}
                  {/* 動画の場合は再生時間、画像の場合はアイコン */}
                  {post.post_type === 1 && post.video_duration ? (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(post.video_duration)}
                    </div>
                  ) : post.post_type === 2 ? (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Image className="w-4 h-4" />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('保存済み投稿');

      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
}