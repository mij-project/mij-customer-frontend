import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProfilePlan } from '@/api/types/profile';
import { useAuth } from '@/providers/AuthContext';
import { Tags, Check, UserPlus, Flame, Star, Sparkles } from 'lucide-react';

interface PlanCardProps {
  plan: ProfilePlan;
  onJoin: (plan: ProfilePlan) => void;
  isOwnProfile: boolean;
  onAuthRequired?: () => void;
  is_subscribed: boolean;
}

const RECOMMENDED_PLAN_TYPE = 2;

const NO_IMAGE_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEwMCAxMDBaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTRBRiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

export default function PlanCard({ plan, onJoin, isOwnProfile, onAuthRequired, is_subscribed }: PlanCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePlanClick = (planId: string) => {
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }
    // 現在のタブとスクロール位置をsessionStorageに保存（Profileページに戻った時に復元するため）
    sessionStorage.setItem('profileActiveTab', 'plans');
    sessionStorage.setItem('profileScrollPosition', window.scrollY.toString());
    navigate(`/plan/${planId}`);
  };

  const planPosts = plan.plan_post?.slice(0, 3) || [];

  // サムネイルが3枚未満の場合は、NO_IMAGE_URLで埋める
  const displayPosts = [...planPosts];
  while (displayPosts.length < 3) {
    displayPosts.push({ description: '', thumbnail_url: NO_IMAGE_URL });
  }

  // type=2の場合は「おすすめ」バッジを表示
  const isRecommended = plan.type === RECOMMENDED_PLAN_TYPE;

  return (
    <div className={`relative overflow-hidden mt-5 mb-4 ${isRecommended
      ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-300 shadow-xl rounded-2xl'
      : 'bg-white border border-gray-200 rounded-lg'
    }`}>
      {/* おすすめバッジ（カード上部） */}
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-1 shadow-md">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="tracking-wide">おすすめプラン</span>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
        </div>
      )}

      {/* サムネイル画像 */}
      <div className={`relative ${isRecommended ? 'mt-8' : ''}`}>
        <div className="grid grid-cols-3 gap-0.5">
          {displayPosts.map((post, index) => (
            <div key={index} className="aspect-square" onClick={() => handlePlanClick(plan.id)}>
              <img
                src={post.thumbnail_url || NO_IMAGE_URL}
                alt={post.description || `${plan.name} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = NO_IMAGE_URL;
                }}
              />
            </div>
          ))}
        </div>

        {/* セール中バッジ */}
        {plan.is_time_sale && (
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Tags className="h-4 w-4" />
              <span className="whitespace-nowrap">セール中</span>
            </div>
          </div>
        )}
      </div>

      {/* プラン情報 */}
      <div className="p-4">
        <h3
          className="text-base font-bold text-gray-900 mb-1"
          onClick={() => handlePlanClick(plan.id)}
        >
          {plan.name}
        </h3>

        {plan.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{plan.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-4 text-xs text-gray-600 cursor-pointer"
            onClick={() => handlePlanClick(plan.id)}
          >
            <span>
              投稿数 <span className="font-semibold text-gray-900">{plan.post_count || 0}</span>
            </span>
            <span>
              月額料金{' '}
              <span className="font-semibold text-gray-900">
                {plan.is_time_sale ? (
                  <span className="inline-flex items-baseline gap-2">
                    <span className="text-xs text-gray-500 line-through">¥{plan.price.toLocaleString()}/月</span>
                    <span className="text-xl font-semibold text-gray-900">
                      ¥{(plan.price - Math.ceil(plan.time_sale_info?.sale_percentage * plan.price * 0.01)).toLocaleString()}
                      <span className="text-xs text-gray-500">
                        /月
                      </span>
                    </span>
                  </span>
                ) : (
                  <span className="font-semibold text-gray-900">¥{plan.price.toLocaleString()}/月</span>
                )}
              </span>
            </span>
          </div>
          {isOwnProfile && !is_subscribed ? (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 h-9 font-medium rounded-full"
              onClick={() => navigate(`/plan/edit/${plan.id}`)}
            >
              編集
            </Button>
          ) : is_subscribed ? (
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md flex-shrink-0">
              <Check className="h-5 w-5" />
              加入中
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-primary text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md flex-shrink-0"
              onClick={() => {
                if (!user) {
                  if (onAuthRequired) {
                    onAuthRequired();
                  }
                  return;
                }
                onJoin(plan);
              }}
            >
              <UserPlus className="h-5 w-5" />
              加入する
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
