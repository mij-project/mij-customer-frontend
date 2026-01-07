import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { cn } from '@/lib/utils';
import { Banner, PreRegisterUser } from '@/api/endpoints/banners';
import { AlertCircle, Info, X } from 'lucide-react';

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

// 重要なお知らせの型定義
interface ImportantNotice {
  id: string;
  title: string;
  subtitle: string;
  payload: {
    message: string;
  };
  type: 'critical' | 'important' | 'info'; // 重要度
  url?: string; // 詳細ページのURL
}

// 重要なお知らせのダミーデータ
const IMPORTANT_NOTICES: ImportantNotice[] = [
  {
    id: '9a3d36a5-a430-4248-8267-7cbfd20ac3d3',
    type: 'important',
    title: '【重要なお知らせ｜決済について】',
    subtitle: 'VISAおよびMasterCard決済が一時的に停止',
    payload: {
      message: `## 【重要なお知らせ｜決済について】

mijfansをご利用いただいている皆さまへ。

現在、**VISAおよびMasterCard決済がご利用いただけない状況**となっております。

リリース直後のタイミングでのご案内となり、  
ご不便・ご迷惑をおかけしておりますことを、心よりお詫び申し上げます。

---

### ■ 現在ご利用可能な決済手段

- **クレジットカード（JCB）**

### ■ 近日中に利用可能予定の決済手段

- **銀行振込**
- **BitCash**

決済手段につきましては、順次拡充を進めており、  
**新たにご利用可能となり次第、改めてお知らせいたします。**

引き続き、皆さまに安心して活動・ご利用いただける環境づくりに努めてまいりますので、  
何卒ご理解・ご協力のほど、よろしくお願い申し上げます。`,
    },
  },
];

// スライドアイテムの型定義
type SlideItem = {
  type: 'banner' | 'user';
  banner?: Banner;
  user?: PreRegisterUser;
};

export default function BannerCarouselSection({
  banners,
  preRegisterUsers,
}: BannerCarouselSectionProps) {
  const navigate = useNavigate();
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [closedNotices, setClosedNotices] = useState<Set<string>>(new Set());

  // バナーと事前登録ユーザーを統合したスライドアイテムを作成
  const slideItems: SlideItem[] = [
    ...banners.map((banner) => ({ type: 'banner' as const, banner })),
    ...preRegisterUsers.map((user) => ({ type: 'user' as const, user })),
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

  const handleCloseNotice = (noticeId: string) => {
    setClosedNotices((prev) => new Set(prev).add(noticeId));
  };

  const handleNoticeClick = (notice: ImportantNotice) => {
    navigate(`/notification/${notice.id}`, { state: { notification: notice } });
  };

  // 表示するお知らせをフィルタリング
  const visibleNotices = IMPORTANT_NOTICES.filter((notice) => !closedNotices.has(notice.id));

  // 重要度に応じたスタイルを取得
  const getNoticeStyles = (type: ImportantNotice['type']) => {
    switch (type) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-800',
          titleColor: 'text-red-900',
          iconColor: 'text-red-600',
          IconComponent: AlertCircle,
        };
      case 'important':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-800',
          titleColor: 'text-yellow-900',
          iconColor: 'text-yellow-600',
          IconComponent: AlertCircle,
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-800',
          titleColor: 'text-blue-900',
          iconColor: 'text-blue-600',
          IconComponent: Info,
        };
    }
  };

  if (slideItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-white">
      <div className="max-w-screen-sm mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* 重要なお知らせセクション */}
        <div className="space-y-3 mb-6">
          {visibleNotices.map((notice) => {
            const styles = getNoticeStyles(notice.type);
            const Icon = styles.IconComponent;

            return (
              <div
                key={notice.id}
                className={`${styles.bgColor} border-l-4 ${styles.borderColor} rounded-lg p-2 cursor-pointer transition-opacity hover:opacity-80`}
                onClick={() => handleNoticeClick(notice)}
              >
                <div className="flex gap-3 items-start">
                  <Icon className={`${styles.iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <h3 className={`${styles.titleColor} font-semibold text-sm mb-1 break-words`}>
                      {notice.title}
                    </h3>
                    <p className={`${styles.textColor} text-xs break-words mb-1`}>
                      現在VISA/MasterCard決済が停止しております。
                    </p>
                    <p
                      className={`${styles.textColor} text-xs break-words underline hover:opacity-70 cursor-pointer`}
                      onClick={() => handleNoticeClick(notice)}
                    >
                      詳しくはこちら
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseNotice(notice.id);
                    }}
                    className={`${styles.iconColor} hover:opacity-70 flex-shrink-0 p-1`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 統合バナーカルーセル */}
        <div ref={sliderRef} className="keen-slider">
          {slideItems.map((item, index) => (
            <div
              key={item.type === 'banner' ? item.banner?.id : item.user?.id}
              className={cn(
                'keen-slider__slide flex-shrink-0 w-[80%] md:w-[60%] h-[140px] relative rounded-lg overflow-hidden',
                item.type === 'banner' && item.banner?.type === BANNER_TYPE.IMAGE_ONLY
                  ? ''
                  : 'cursor-pointer'
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
                  {item.banner.type !== BANNER_TYPE.IMAGE_ONLY &&
                  item.banner.image_source === IMAGE_SOURCE.USER_PROFILE &&
                  item.banner.avatar_url ? (
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
