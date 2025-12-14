import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscribedPlanDetail } from '@/api/types/account';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface SubscriptionPlanCardProps {
  plan: SubscribedPlanDetail;
  onUnsubscribe?: (planId: string) => void;
}

export default function SubscriptionPlanCard({ plan, onUnsubscribe }: SubscriptionPlanCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (plan.creator_username) {
      navigate(`/profile?username=${plan.creator_username}`);
    }
  };

  const handleUnsubscribe = () => {
    if (onUnsubscribe) {
      onUnsubscribe(plan.plan_id);
    }
  };

  // Calculate subscription dates
  const startDate = new Date(plan.purchase_created_at);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // Truncate description
  const MAX_DESCRIPTION_LENGTH = 60;
  const shouldTruncate = plan.plan_description && plan.plan_description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = isExpanded || !shouldTruncate
    ? plan.plan_description
    : plan.plan_description?.substring(0, MAX_DESCRIPTION_LENGTH);

  return (
    <div className="bg-white border border-gray-200 py-6 px-6 rounded-lg">
      {/* Header: Creator Info + Menu */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
          onClick={handleCreatorClick}
        >
          <img
            src={plan.creator_avatar_url || '/assets/no-image.svg'}
            alt={plan.creator_profile_name || 'Creator'}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm truncate">
              {plan.creator_profile_name || 'クリエイター'}
            </div>
            {plan.creator_username && (
              <div className="text-xs text-gray-500 truncate">
                @{plan.creator_username}
              </div>
            )}
          </div>
        </div>

        {/* Three-dot menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <circle cx="10" cy="4" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="10" cy="16" r="1.5" />
              </svg>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[160px] bg-white rounded-md shadow-lg border border-gray-200 p-1 z-50"
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item
                className="text-sm text-red-600 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded outline-none"
                onClick={handleUnsubscribe}
              >
                解約する
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Plan Name */}
      <div className="mb-2">
        <h3 className="text-base font-bold text-primary">
          {plan.plan_name}
        </h3>
      </div>

      {/* Price and Post Count */}
      <div className="flex items-baseline gap-3 mb-2 text-sm">
        <div>
          <span className="text-lg font-bold">¥{plan.price}</span>
          <span className="text-gray-600"> / 月</span>
        </div>
        <div className="text-gray-600">
          投稿<span className="font-bold text-black">{plan.post_count}</span>件
        </div>
      </div>

      {/* Description */}
      {plan.plan_description && (
        <div className="text-sm text-gray-700 mb-2">
          {displayDescription}
          {shouldTruncate && !isExpanded && '...'}
          {shouldTruncate && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
              className="text-blue-500 ml-1 hover:underline"
            >
              {isExpanded ? '閉じる' : '続きを読む'}
            </button>
          )}
        </div>
      )}

      {/* Subscription Dates */}
      <div className="text-xs text-gray-500">
        加入日：{formatDate(startDate)} 次回更新日：{formatDate(endDate)}
      </div>
    </div>
  );
}
