import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProfilePlan } from '@/api/types/profile';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';

interface HorizontalPlanListProps {
  plans: ProfilePlan[];
  onPlanClick: (plan: ProfilePlan) => void;
  isOwnProfile: boolean;
  onAuthRequired?: () => void;
}

const RECOMMENDED_PLAN_TYPE = 2;
const NORMAL_PLAN_TYPE = 1;

const NO_IMAGE_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEwMCAxMDBaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTRBRiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

export default function HorizontalPlanList({ plans, onPlanClick, isOwnProfile, onAuthRequired }: HorizontalPlanListProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const autoSlideIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // おすすめプラン（type=2）のみをフィルタリング

  const handlePlanClick = (plan: ProfilePlan) => {
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }
    // 現在のスクロール位置をsessionStorageに保存（Profileページに戻った時に復元するため）
    sessionStorage.setItem('profileActiveTab', 'plans');
    sessionStorage.setItem('profileScrollPosition', window.scrollY.toString());
    navigate(`/plan/${plan.id}`);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % plans.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + plans.length) % plans.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // スワイプの最小距離（px）
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsDragging(true);
    // 自動スライドを一時停止
    if (autoSlideIntervalRef.current) {
      clearInterval(autoSlideIntervalRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStartX(0);
    setTouchEndX(0);
    setIsDragging(false);
    
    // 自動スライドを再開
    startAutoSlide();
  };

  // マウスイベント（デスクトップ対応）
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStartX(e.clientX);
    setIsDragging(true);
    if (autoSlideIntervalRef.current) {
      clearInterval(autoSlideIntervalRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTouchEndX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (!touchStartX || !touchEndX) {
      setIsDragging(false);
      return;
    }
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStartX(0);
    setTouchEndX(0);
    setIsDragging(false);
    
    startAutoSlide();
  };

  const startAutoSlide = useCallback(() => {
    if (plans.length <= 1) return;
    if (autoSlideIntervalRef.current) {
      clearInterval(autoSlideIntervalRef.current);
    }
    autoSlideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % plans.length);
    }, 5000);
  }, [plans.length]);

  // 自動スライド（5秒ごと）
  useEffect(() => {
    startAutoSlide();
    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
      }
    };
  }, [startAutoSlide]);

  return (
    <div className="bg-secondary border-t border-b border-gray-200 py-4">
      <div className="relative">
        {/* スライドコンテナ */}
        <div 
          ref={containerRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateX(-${currentSlide * 100}%)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
            }}
          >
            {plans.map((plan) => {
              const planPosts = plan.plan_post?.slice(0, 3) || [];

              // サムネイルが3枚未満の場合は、NO_IMAGE_URLで埋める
              const displayPosts = [...planPosts];
              while (displayPosts.length < 3) {
                displayPosts.push({ description: '', thumbnail_url: NO_IMAGE_URL });
              }

              // type=2の場合は「おすすめ」バッジを表示
              const isRecommended = plan.type === RECOMMENDED_PLAN_TYPE;

              return (
                <div key={plan.id} className="flex-shrink-0 w-full px-4">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* サムネイル画像 */}
                    <div className="relative">
                      <div className="grid grid-cols-3 gap-0.5">
                        {displayPosts.map((post, index) => (
                          <div
                            key={index}
                            className="aspect-square"
                            onClick={() => handlePlanClick(plan)}
                          >
                            <img
                              src={post.thumbnail_url || NO_IMAGE_URL}
                              alt={post.description || `${plan.name} thumbnail ${index + 1}`}
                              className="w-full aspect-square object-cover"
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
                      <h3
                        className="text-base font-bold text-gray-900 mb-1"
                        onClick={() => handlePlanClick(plan)}
                      >
                        {plan.name}
                      </h3>

                      {plan.description && (
                        <p 
                         className="text-xs text-gray-600 mb-3 line-clamp-2 " 
                         onClick={() => handlePlanClick(plan)}
                         >
                          {plan.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center space-x-4 text-xs text-gray-600 cursor-pointer"
                          onClick={() => handlePlanClick(plan)}
                        >
                          <span>
                            投稿数 <br />
                            <span className="font-semibold text-gray-900">{plan.post_count || 0}</span>
                          </span>
                          <span>
                            月額料金
                            <br />{' '}
                            <span className="font-semibold text-gray-900">
                              ¥{plan.price.toLocaleString()}/月
                            </span>
                          </span>
                        </div>

                        {!isOwnProfile && (
                          <>
                            {plan.is_subscribed ? (
                              <Button className="bg-secondary text-gray-600 px-4 py-2 rounded-full text-xs font-bold text-center whitespace-nowrap">
                                加入中
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 h-9 font-medium rounded-full"
                                onClick={() => {
                                  if (!user) {
                                    if (onAuthRequired) {
                                      onAuthRequired();
                                    }
                                    return;
                                  }
                                  onPlanClick(plan);
                                }}
                              >
                                加入する
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* ドットインジケーター */}
        {plans.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {plans.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-2 h-2 bg-primary'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`スライド ${index + 1} に移動`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
