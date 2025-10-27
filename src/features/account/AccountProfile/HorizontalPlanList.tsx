import React from 'react';
import { ProfilePlan } from '@/api/types/profile';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HorizontalPlanListProps {
  plans: ProfilePlan[];
  onPlanClick: (plan: ProfilePlan) => void;
}

const RECOMMENDED_PLAN_TYPE = 2;
const NORMAL_PLAN_TYPE = 1;

const NO_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEwMCAxMDBaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTRBRiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

export default function HorizontalPlanList({ plans, onPlanClick }: HorizontalPlanListProps) {
  const navigate = useNavigate();
  if (plans.length === 0) return null;

  const handlePlanClick = (plan: ProfilePlan) => {
    navigate(`/plan/${plan.id}`);
  };

  return (
    <div className="bg-gray-200 border-b border-gray-200 py-4">
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {plans.map((plan) => {
          const thumbnails = plan.thumbnails?.slice(0, 3) || [];
          
          // サムネイルが3枚未満の場合は、NO_IMAGE_URLで埋める
          const displayThumbnails = [...thumbnails];
          while (displayThumbnails.length < 3) {
            displayThumbnails.push(NO_IMAGE_URL);
          }

          // type=2の場合は「おすすめ」バッジを表示
          const isRecommended = plan.type === RECOMMENDED_PLAN_TYPE;

          return (
            <div
              key={plan.id}
              className="flex-shrink-0 w-72 bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* サムネイル画像 */}
              <div className="relative">
                <div className="grid grid-cols-3 gap-0.5">
                  {displayThumbnails.map((thumbnail, index) => (
                    <div key={index} className="aspect-square" onClick={() => handlePlanClick(plan)}>
                      <img
                        src={thumbnail || NO_IMAGE_URL}
                        alt={`${plan.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = NO_IMAGE_URL;
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* おすすめバッジ */}
                {isRecommended && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    おすすめ
                  </div>
                )}
              </div>

              {/* プラン情報 */}
              <div className="p-4">
                <h3 className="text-base font-bold text-gray-900 mb-1" onClick={() => handlePlanClick(plan)}>{plan.name}</h3>

                {plan.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{plan.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-600 cursor-pointer" onClick={() => handlePlanClick(plan)}>
                    <span>投稿数  <br /><span className="font-semibold text-gray-900">{plan.post_count || 0}</span></span>
                    <span>月額料金　<br /> <span className="font-semibold text-gray-900">¥{plan.price.toLocaleString()}/月</span></span>
                  </div>

                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 h-9 font-medium"
                    onClick={() => onPlanClick(plan)}
                  >
                    加入する
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
