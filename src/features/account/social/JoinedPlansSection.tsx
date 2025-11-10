import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountInfo, SubscribedPlanDetail } from '@/api/types/account';
import { Video } from 'lucide-react';

interface JoinedPlansSectionProps {
  accountInfo: AccountInfo | null;
}

export default function JoinedPlansSection({ accountInfo }: JoinedPlansSectionProps) {
  const navigate = useNavigate();
  const subscribedPlans = accountInfo?.plan_info?.subscribed_plan_details || [];

  console.log('subscribedPlans', subscribedPlans);

  if (subscribedPlans.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="text-center text-gray-500 py-8">加入中のプランはありません</div>
      </div>
    );
  }

  const handleUserClick = (username: string) => {
    navigate(`/account/profile?username=${username}`);
  };

  const handlePlanClick = (planId: string) => {
    navigate(`/plan/post/list?plan_id=${planId}`);
  };

  return (
    <div className="px-6 py-8 space-y-4">
      {subscribedPlans.map((plan: SubscribedPlanDetail) => (
        <div key={plan.purchase_id} className="bg-white border border-gray-200 rounded-lg p-4">
          {/* Header with creator info */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-600">
                {plan.creator_profile_name || 'クリエイター'}
              </div>
              <div className="font-medium text-gray-900">{plan.plan_name}</div>
            </div>
            <div className="flex-shrink-0">
              <img
                src={plan.creator_avatar_url || '/assets/no-image.svg'}
                alt={plan.creator_profile_name || 'クリエイター'}
                className="w-12 h-12 rounded-full object-cover"
                onClick={() => handleUserClick(plan.creator_username)}
              />
            </div>
          </div>

          {/* Post count */}
          <div onClick={() => handlePlanClick(plan.plan_id)} className="cursor-pointer">
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <div className="flex flex-col">
                <span>投稿数</span>
                <span>{plan.post_count}件</span>
              </div>

              <div className="flex flex-col">
                <span>月額料金</span>
                <span>{plan.price}円</span>
              </div>
            </div>

            {/* Thumbnail grid - always show 4 slots */}
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, index) => {
                const thumbnailUrl = plan.thumbnail_keys?.[index];
                return (
                  <div key={index} className="aspect-video bg-gray-200 rounded overflow-hidden">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={`投稿 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
