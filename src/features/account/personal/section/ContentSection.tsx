import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentSectionProps } from '@/features/account/personal/section/types';

const NO_IMAGE_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEwMCAxMDBaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTRBRiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

export default function ContentSection({
  activeTab,
  posts,
  plans,
  individualPurchases,
  gachaItems,
}: ContentSectionProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderEmptyState = (type: string) => (
    <div className="p-6 text-center text-gray-500">{type}はありません。</div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={post.thumbnail_storage_key || NO_IMAGE_URL}
                    alt={post.title}
                    className="w-full h-40 object-cover"
                  />
                  {post.video_duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(post.video_duration)}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{post.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          renderEmptyState('投稿')
        );
      case 'plans':
        return plans.length > 0 ? (
          <div className="p-6 space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={NO_IMAGE_URL}
                    alt={plan.name}
                    className="w-20 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    )}
                    {/* <p className="text-sm font-medium text-primary">月額料金 ¥{plan.price.toLocaleString()}/月</p> */}
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">加入</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          renderEmptyState('プラン')
        );
      case 'individual':
        return individualPurchases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {individualPurchases.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={item.post?.thumbnail_storage_key || NO_IMAGE_URL}
                    alt="購入アイテム"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-white text-sm px-2 py-1 rounded">
                    ¥{item.amount.toLocaleString()}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.post?.title || '単品購入'}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          renderEmptyState('単品購入')
        );
      case 'gacha':
        return gachaItems.length > 0 ? (
          <div className="p-6 space-y-4">
            {gachaItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={NO_IMAGE_URL}
                      alt="ガチャアイテム"
                      className="w-20 h-16 object-cover rounded"
                    />
                    <Star className="absolute top-1 left-1 h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">ガチャアイテム</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm font-medium text-primary">
                        ¥{item.amount.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          renderEmptyState('ガチャ')
        );
      default:
        return null;
    }
  };

  return renderContent();
}
