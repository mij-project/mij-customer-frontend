import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountInfo, SubscribedPlanDetail } from '@/api/types/account';

interface JoinedPlansSectionProps {
  accountInfo: AccountInfo | null;
}

export default function JoinedPlansSection({ accountInfo }: JoinedPlansSectionProps) {
  const navigate = useNavigate();
  const subscribedPlans = accountInfo?.plan_info?.subscribed_plan_details || [];

  if (subscribedPlans.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="text-center text-gray-500 py-8">加入中のプランはありません</div>
      </div>
    );
  }

  const handleCreatorClick = (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile?username=${username}`);
  };

  const handlePlanClick = (planId: string) => {
    navigate(`/plan/${planId}`);
  };

  return (
    <div className="px-2 py-8">
      {subscribedPlans.map((plan: SubscribedPlanDetail) => (
        <div key={plan.purchase_id} className="bg-white border-b border-gray-200 overflow-hidden">
          {/* Header with creator info and avatar */}
          <div className="flex items-start justify-between p-4 pb-3">
            <div className="cursor-pointer flex-1" >
              <div className="font-bold text-gray-900 mb-1" onClick={() => handlePlanClick(plan.plan_id)}>
                {plan.creator_profile_name || 'クリエイター'}
              </div>
              <div className="text-sm text-gray-600" onClick={() => handlePlanClick(plan.plan_id)}>{plan.plan_name}</div>
            </div>
            <div
              className="flex-shrink-0 ml-3 cursor-pointer"
              onClick={(e) => handleCreatorClick(plan.creator_username, e)}
            >
              <img
                src={plan.creator_avatar_url || '/assets/no-image.svg'}
                alt={plan.creator_profile_name || 'クリエイター'}
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Plan details - clickable area */}
          <div onClick={() => handlePlanClick(plan.plan_id)} className="cursor-pointer px-4 pb-4">
            {/* Post count and price */}
            <div className="flex items-center gap-4 text-sm mb-3">
              <div className="flex items-baseline gap-1">
                <span className="text-gray-600">投稿数</span>
                <span className="font-medium text-gray-900">{plan.post_count}件</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-gray-600">月額料金</span>
                <span className="font-medium text-gray-900">
                  {plan.price > 0 ? `${plan.price}円` : '0円'}/月
                </span>
              </div>
            </div>

            {/* Thumbnail grid */}
            {plan.post_count > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {plan.thumbnail_keys?.slice(0, 3).map((thumbnailUrl, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded overflow-hidden">
                    <img
                      src={thumbnailUrl || '/assets/no-image.svg'}
                      alt={`投稿 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {/* Fill empty slots if less than 3 thumbnails */}
                {Array.from({ length: Math.max(0, 3 - (plan.thumbnail_keys?.length || 0)) }).map(
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square bg-gray-200 rounded overflow-hidden"
                    />
                  )
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg py-12 text-center text-gray-500 text-sm">
                投稿がありません
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
