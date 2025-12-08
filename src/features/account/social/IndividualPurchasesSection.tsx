import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountInfo } from '@/features/account/types';
import PostCard from '@/features/account/components/PostCard';

interface IndividualPurchasesSectionProps {
  accountInfo: AccountInfo | null;
}

export default function IndividualPurchasesSection({
  accountInfo,
}: IndividualPurchasesSectionProps) {
  const navigate = useNavigate();
  const singlePurchases = accountInfo?.plan_info?.single_purchases_data || [];
  const purchaseCount = accountInfo?.plan_info?.single_purchases_count || 0;

  const handleUserClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  return (
    <div className="px-6 py-8">
      <div className="bg-white mb-4">
        <div className="text-center mb-4">
          <div className="text-lg font-bold text-gray-900">{purchaseCount}件</div>
        </div>

        {singlePurchases.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {singlePurchases.map((purchase: any) => (
              <PostCard
                key={purchase.purchase_id}
                id={purchase.post_id}
                thumbnailUrl={purchase.thumbnail_key || '/assets/no-image.svg'}
                title={purchase.post_title || ''}
                creatorAvatar={purchase.creator_avatar_url || '/assets/no-image.svg'}
                creatorName={purchase.creator_name}
                creatorUsername={purchase.creator_username}
                likesCount={0}
                commentsCount={0}
                onClick={handlePostClick}
                onCreatorClick={handleUserClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">単品購入履歴はありません</div>
        )}
      </div>
    </div>
  );
}
