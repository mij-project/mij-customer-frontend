import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { cn } from '@/lib/utils';
import { Banner } from '@/api/endpoints/banners';

interface BannerCarouselSectionProps {
  banners: Banner[];
}

const BANNER_TYPE = {
  CREATOR: 1,
  EVENT: 2,
};

const IMAGE_SOURCE = {
  USER_PROFILE: 1,
  ADMIN_POST: 2,
};

export default function BannerCarouselSection({ banners }: BannerCarouselSectionProps) {
  const navigate = useNavigate();
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
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
    if (!instanceRef.current || banners.length === 0) return;

    timer.current = setInterval(() => {
      instanceRef.current?.next();
    }, 3000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [instanceRef, banners.length]);

  const handleBannerClick = (banner: Banner) => {
    if (banner.type === BANNER_TYPE.CREATOR) {
      // クリエイタータイプ: プロフィールページへ遷移
      if (banner.creator_username) {
        navigate(`/account/profile?username=${banner.creator_username}`);
      }
    } else if (banner.type === BANNER_TYPE.EVENT) {
      // イベントタイプ: 外部URLへ遷移（新しいタブ）
      if (banner.external_url) {
        window.open(banner.external_url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="bg-white">
      <div className="max-w-screen-sm mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div ref={sliderRef} className="keen-slider">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="keen-slider__slide flex-shrink-0 w-[80%] md:w-[60%] h-60 relative rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleBannerClick(banner)}
            >
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.alt_text}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">画像なし</span>
                </div>
              )}
              {banner.image_source === IMAGE_SOURCE.USER_PROFILE && banner.avatar_url ? (
                <div className="absolute left-3 bottom-3 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img
                      src={banner.avatar_url}
                      alt={banner.creator_profile_name ?? banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {banner.creator_profile_name ? (
                    <span className="text-white font-bold text-base leading-tight">
                      {banner.creator_profile_name}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={cn(
                'w-3 h-3 rounded-full',
                idx === currentSlide ? 'bg-primary' : 'bg-gray-300'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
