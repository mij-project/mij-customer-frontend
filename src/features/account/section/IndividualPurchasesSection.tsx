import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountInfo } from '@/features/account/types';

interface IndividualPurchasesSectionProps {
  accountInfo: AccountInfo | null;
}

export default function IndividualPurchasesSection({ accountInfo }: IndividualPurchasesSectionProps) {
  const navigate = useNavigate();
  const singlePurchases = accountInfo?.plan_info?.single_purchases_data || [];
  const purchaseCount = accountInfo?.plan_info?.single_purchases_count || 0;

  const handleUserClick = (username: string) => {
    navigate(`/account/profile?username=${username}`);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  return (
    <div className="px-6 py-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-gray-900 mb-4">単品購入履歴</h3>
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-gray-900">{purchaseCount}件</div>
        </div>
        
        {singlePurchases.length > 0 ? (
          <div className="space-y-3">
            {singlePurchases.map((purchase: any) => (
              <div key={purchase.purchase_id} className="border border-gray-100 rounded p-3">
                <div className="flex items-start space-x-3">
                  <img 
                    src={purchase.creator_avatar_url || '/assets/no-image.svg'} 
                    alt={purchase.creator_name}
                    className="w-10 h-10 rounded-full object-cover"
                    onClick={() => handleUserClick(purchase.creator_username)}
                  />
                  <div className="flex-1"  onClick={() => handlePostClick(purchase.post_id)}>
                    <div className="font-medium text-sm">{purchase.creator_name}</div>
                    <div className="text-xs text-gray-500">@{purchase.creator_username}</div>
                    <div className="text-sm mt-1">{purchase.post_title}</div>
                    <div className="text-sm text-gray-600 mt-1">{purchase.purchase_price}円</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(purchase.purchase_created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  <div className="flex-shrink-0"  onClick={() => handlePostClick(purchase.post_id)}>
                    <img 
                      src={purchase.thumbnail_key || '/assets/no-image.svg'} 
                      alt="投稿のサムネイル"
                      className="w-16 h-16 rounded object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            単品購入履歴はありません
          </div>
        )}
      </div>
    </div>
  );
}
