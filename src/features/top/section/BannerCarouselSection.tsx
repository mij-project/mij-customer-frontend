import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { cn } from '@/lib/utils';
import { Banner, PreRegisterUser } from '@/api/endpoints/banners';

interface BannerCarouselSectionProps {
  banners: Banner[];
  preRegisterUsers: PreRegisterUser[];
}

const BANNER_TYPE = {
  CREATOR: 1,
  EVENT: 2,
  IMAGE_ONLY: 3,
};

const IMAGE_SOURCE = {
  USER_PROFILE: 1,
  ADMIN_POST: 2,
};

// スライドアイテムの型定義
type SlideItem = {
  type: 'banner' | 'user';
  banner?: Banner;
  user?: PreRegisterUser;
};

export default function BannerCarouselSection({ banners, preRegisterUsers }: BannerCarouselSectionProps) {
  const navigate = useNavigate();
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // バナーと事前登録ユーザーを統合したスライドアイテムを作成
  const slideItems: SlideItem[] = [
    ...banners.map(banner => ({ type: 'banner' as const, banner })),
    ...preRegisterUsers.map(user => ({ type: 'user' as const, user })),
  ];

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    slides: {
      origin: 'center',
      perView: 1,
      spacing: 16,
    },
    renderMode: 'performance',
  });

  // 自動スライド処理
  useEffect(() => {
    if (!instanceRef.current || slideItems.length === 0) return;

    timer.current = setInterval(() => {
      instanceRef.current?.next();
    }, 3000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [instanceRef, slideItems.length]);

  const handleBannerClick = (banner: Banner) => {
    if (banner.type === BANNER_TYPE.CREATOR) {
      // クリエイタータイプ: プロフィールページへ遷移
      if (banner.creator_username) {
        navigate(`/profile?username=${banner.creator_username}`);
      }
    } else if (banner.type === BANNER_TYPE.EVENT) {
      // イベントタイプ: 外部URLへ遷移（新しいタブ）
      if (banner.external_url) {
        window.open(banner.external_url, '_blank', 'noopener,noreferrer');
      }
    } else if (banner.type === BANNER_TYPE.IMAGE_ONLY) {
      // 画像のみタイプ: 何もしない（クリック無効）
      return;
    }
  };

  const handleUserClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  const handleSlideClick = (item: SlideItem) => {
    if (item.type === 'banner' && item.banner) {
      handleBannerClick(item.banner);
    } else if (item.type === 'user' && item.user) {
      handleUserClick(item.user.username);
    }
  };

  if (slideItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-white">
      <div className="max-w-screen-sm mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* 統合バナーカルーセル */}
        <div ref={sliderRef} className="keen-slider">
          {slideItems.map((item, index) => (
            <div
              key={item.type === 'banner' ? item.banner?.id : item.user?.id}
              className={cn(
                "keen-slider__slide flex-shrink-0 w-[80%] md:w-[60%] h-[140px] relative rounded-lg overflow-hidden",
                item.type === 'banner' && item.banner?.type === BANNER_TYPE.IMAGE_ONLY ? "" : "cursor-pointer"
              )}
              onClick={() => handleSlideClick(item)}
            >
              {item.type === 'banner' && item.banner ? (
                // バナースライド
                <>
                  {item.banner.image_url ? (
                    <img
                      src={item.banner.image_url}
                      alt={item.banner.alt_text}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">画像なし</span>
                    </div>
                  )}
                  {/* バナータイプ3（画像のみ）以外の場合のみアバター・名前を表示 */}
                  {item.banner.type !== BANNER_TYPE.IMAGE_ONLY && item.banner.image_source === IMAGE_SOURCE.USER_PROFILE && item.banner.avatar_url ? (
                    <div className="absolute left-3 bottom-3 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <img
                          src={item.banner.avatar_url}
                          alt={item.banner.creator_profile_name ?? item.banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {item.banner.creator_profile_name ? (
                        <span className="text-white font-bold text-base leading-tight">
                          {item.banner.creator_profile_name}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : item.type === 'user' && item.user ? (
                // 事前登録ユーザースライド
                <>
                  {item.user.cover_url ? (
                    <img
                      src={item.user.cover_url}
                      alt={item.user.profile_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                  )}
                  <div className="absolute left-3 bottom-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img
                        src={item.user.avatar_url || '/assets/default-avatar.png'}
                        alt={item.user.profile_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white font-bold text-base leading-tight drop-shadow-lg">
                      {item.user.profile_name}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          {slideItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={cn(
                'w-2 h-2 rounded-full',
                idx === currentSlide ? 'bg-primary' : 'bg-gray-300'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
