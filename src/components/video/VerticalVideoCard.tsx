import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Heart,
  Share,
  Bookmark,
  Play,
  Video,
  ArrowRight,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  ImageIcon,
  ChevronsLeft,
  ChevronsRight,
  Tags,
} from 'lucide-react';
import Hls from 'hls.js';
import { PostDetailData } from '@/api/types/post';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  toggleLike,
  getLikeStatus,
  toggleBookmark,
  getBookmarkStatus,
} from '@/api/endpoints/social';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import NoImageSvg from '@/assets/no-image.svg';
import { useAuth } from '@/providers/AuthContext';
import OfficalBadge from '../common/OfficalBadge';
import { useLoopVideoAnalytics } from '@/hooks/useLoopVideoAnalytics';

interface VerticalVideoCardProps {
  post: PostDetailData;
  isActive: boolean;
  onVideoClick: () => void;
  onPurchaseClick: () => void;
  onAuthRequired?: () => void;
  isOverlayOpen: boolean;
}

const FALLBACK_IMAGE = NoImageSvg;

export default function VerticalVideoCard({
  post,
  isActive,
  onVideoClick,
  onPurchaseClick,
  onAuthRequired,
  isOverlayOpen = false,
}: VerticalVideoCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullSize, setIsFullSize] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const barWrapRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // double tap/click (YouTube-like)
  const overlayRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const singleTapTimerRef = useRef<number | null>(null);

  // seek animation
  const [seekFxLeft, setSeekFxLeft] = useState(false);
  const [seekFxRight, setSeekFxRight] = useState(false);
  const seekFxLeftTimerRef = useRef<number | null>(null);
  const seekFxRightTimerRef = useRef<number | null>(null);

  const SEEK_SECONDS = 5;
  const DOUBLE_TAP_MS = 280;

  const isVideo = post.post_type === 1;
  const isImage = post.post_type === 2;

  const videoMedia = isVideo ? post.media_info.find((m) => m.kind === 4 || m.kind === 5) : null;
  const imageMediaList = isImage ? post.media_info.filter((m) => m.kind === 3) : [];
  const mainMedia = post.media_info[0];
  const isPortrait = mainMedia?.orientation === 1;

  const isPurchased = post.is_purchased;

  const descRef = useRef<HTMLDivElement>(null);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;

    const measure = () => {
      const isOverflow = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
      setCanExpand(isOverflow);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [post.description, isDescriptionExpanded]);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 1, spacing: 0 },
    slideChanged(slider) {
      setCurrentImageIndex(slider.track.details.rel);
    },
  });

  useEffect(() => {
    const fetchSocialStatus = async () => {
      try {
        const likeResponse = await getLikeStatus(post.id);
        setLiked(likeResponse.data.liked);
        setLikesCount(likeResponse.data.likes_count);

        const bookmarkResponse = await getBookmarkStatus(post.id);
        setBookmarked(bookmarkResponse.data.bookmarked);
      } catch (error) {
        console.error('Failed to fetch social status:', error);
      }
    };
    fetchSocialStatus();
  }, [post.id, user]);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onAuthRequired?.();
      return;
    }
    try {
      const response = await toggleLike(post.id);
      const newLikedState = response.data.liked ?? !liked;
      setLiked(newLikedState);
      setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onAuthRequired?.();
      return;
    }
    try {
      const response = await toggleBookmark(post.id);
      setBookmarked(response.data.bookmarked ?? !bookmarked);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const checkOrientation = () => setIsLandscape(window.innerWidth > window.innerHeight);
    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);
    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  const updateBuffered = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const ranges = v.buffered;
    let end = 0;
    for (let i = 0; i < ranges.length; i++) {
      if (ranges.start(i) <= v.currentTime && v.currentTime <= ranges.end(i)) {
        end = ranges.end(i);
        break;
      }
      end = Math.max(end, ranges.end(i));
    }
    setBufferedEnd(end);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!isVideo || !video || !videoMedia?.storage_key) return;

    const onLoadedMetadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
    };
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onProgress = () => updateBuffered();

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('progress', onProgress);

    if (videoMedia.storage_key.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hlsRef.current = hls;
        hls.loadSource(videoMedia.storage_key);
        hls.attachMedia(video);

        hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
          const total = data?.details?.totalduration;
          if (Number.isFinite(total) && total > 0) setDuration(total);
        });

        hls.on(Hls.Events.ERROR, () => {});
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoMedia.storage_key;
      }
    } else {
      video.src = videoMedia.storage_key;
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('progress', onProgress);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isVideo, videoMedia?.storage_key, updateBuffered]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (isOverlayOpen) {
      v.pause();
      setIsPlaying(false);
      return;
    }

    if (isActive) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, [isActive, isOverlayOpen]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;

    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
    onVideoClick();
  };

  const seekBy = (deltaSeconds: number) => {
    const v = videoRef.current;
    if (!v) return;

    const d = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : duration;
    const next = Math.min(Math.max(v.currentTime + deltaSeconds, 0), d || Infinity);

    v.currentTime = next;
    setCurrentTime(next);
  };

  const triggerSeekFx = (side: 'left' | 'right') => {
    const HIDE_MS = 380;

    if (side === 'left') {
      setSeekFxLeft(true);
      if (seekFxLeftTimerRef.current) window.clearTimeout(seekFxLeftTimerRef.current);
      seekFxLeftTimerRef.current = window.setTimeout(() => {
        setSeekFxLeft(false);
        seekFxLeftTimerRef.current = null;
      }, HIDE_MS);
      return;
    }

    setSeekFxRight(true);
    if (seekFxRightTimerRef.current) window.clearTimeout(seekFxRightTimerRef.current);
    seekFxRightTimerRef.current = window.setTimeout(() => {
      setSeekFxRight(false);
      seekFxRightTimerRef.current = null;
    }, HIDE_MS);
  };

  // YouTube-like: single tap = play/pause, double tap = seek +/- 5s (only when not fullscreen)
  const handleOverlayPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (isFullscreen) return;
    if (isOverlayOpen) return;

    e.preventDefault();
    e.stopPropagation();

    const now = Date.now();
    const isDouble = now - lastTapRef.current <= DOUBLE_TAP_MS;
    lastTapRef.current = now;

    const el = overlayRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;

    if (isDouble) {
      if (singleTapTimerRef.current) {
        window.clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      onVideoClick();
      seekBy(isLeftHalf ? -SEEK_SECONDS : SEEK_SECONDS);
      triggerSeekFx(isLeftHalf ? 'left' : 'right');
      return;
    }

    if (singleTapTimerRef.current) window.clearTimeout(singleTapTimerRef.current);
    singleTapTimerRef.current = window.setTimeout(() => {
      togglePlay();
      singleTapTimerRef.current = null;
    }, DOUBLE_TAP_MS);
  };

  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) window.clearTimeout(singleTapTimerRef.current);
      if (seekFxLeftTimerRef.current) window.clearTimeout(seekFxLeftTimerRef.current);
      if (seekFxRightTimerRef.current) window.clearTimeout(seekFxRightTimerRef.current);
    };
  }, []);

  const posToTime = (clientX: number) => {
    const el = barWrapRef.current;
    if (!el || duration <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    return (x / rect.width) * duration;
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    setDragging(true);
    const t = posToTime(e.clientX);
    videoRef.current.currentTime = t;
    setCurrentTime(t);
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging || !videoRef.current) return;
    e.preventDefault();
    const t = posToTime(e.clientX);
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    videoRef.current?.pause();
    onPurchaseClick?.();
  };

  const handleFullscreenClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    try {
      const elem = video as any;
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
      else if (elem.webkitEnterFullscreen) elem.webkitEnterFullscreen();
      else if (elem.mozRequestFullScreen) await elem.mozRequestFullScreen();
      else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();
      setIsFullscreen(true);
    } catch (error) {
      console.error('フルスクリーンエラー:', error);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleFullscreenChange = () => {
      const doc = document as any;
      const vid = video as any;
      const isCurrentlyFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement ||
        vid.webkitDisplayingFullscreen
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    const handleWebkitEnd = () => setIsFullscreen(false);

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    video.addEventListener('webkitendfullscreen', handleWebkitEnd);
    video.addEventListener('webkitbeginfullscreen', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      video.removeEventListener('webkitendfullscreen', handleWebkitEnd);
      video.removeEventListener('webkitbeginfullscreen', handleFullscreenChange);
    };
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    v.muted = newMutedState;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({ title: `mijfans`, url: window.location.href })
        .catch((error) => console.log('Share error:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('URLをコピーしました');
    }
  };

  // ビデオアナリティクス
  useLoopVideoAnalytics({
    videoRef,
    post,
    media: mainMedia,
    autoplay: true,
    completeThreshold: 0.95,
  });

  return (
    <div
      ref={fullscreenContainerRef}
      className={`video-fullscreen-container ${isFullSize ? 'fixed inset-0 z-[9999]' : 'relative'} w-full bg-black flex items-center justify-center ${isFullSize ? 'h-screen' : 'h-full'}`}
      style={
        { touchAction: 'none', overflowX: 'hidden', overflowY: 'hidden' } as React.CSSProperties
      }
    >
      {/* 上部ナビゲーション */}
      <div
        className="absolute top-0 left-0 right-0 w-full flex items-center justify-between px-4 z-[100]"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full cursor-pointer transition-colors"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-7 w-7 text-white" strokeWidth={2.5} />
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full cursor-pointer transition-colors"
          onClick={handleShare}
        >
          <Share className="h-6 w-6 text-white" strokeWidth={2} />
        </div>
      </div>

      <div className="relative w-full h-full flex justify-center overflow-hidden items-center">
        {/* 動画 */}
        {isVideo && videoMedia ? (
          <>
            <video
              ref={videoRef}
              className={`${
                isFullscreen
                  ? 'w-full h-full object-contain'
                  : isPortrait
                    ? 'w-full h-full object-cover'
                    : 'w-full h-auto object-contain'
              }`}
              style={!isFullscreen && !isPortrait ? { marginTop: '-20%' } : undefined}
              loop
              muted={isMuted}
              playsInline
              controls={isFullscreen}
            />

            {/* Tap layer: single = play/pause, double = seek +/- 5s */}
            <div
              ref={overlayRef}
              className="absolute inset-0 z-10"
              style={{ bottom: '35%' }}
              onPointerUp={handleOverlayPointerUp}
            />

            {/* Double tap seek FX */}
            <div className="pointer-events-none absolute inset-0 z-20">
              {/* LEFT */}
              <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-center">
                <div
                  className={[
                    'flex items-center gap-2 rounded-full px-4 py-2',
                    'bg-transparent text-white',
                    'transition-all duration-200 ease-out',
                    seekFxLeft ? 'opacity-100 scale-100' : 'opacity-0 scale-90',
                  ].join(' ')}
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="text-sm font-semibold tabular-nums">-5</span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center">
                <div
                  className={[
                    'flex items-center gap-2 rounded-full px-4 py-2',
                    'bg-transparent text-white',
                    'transition-all duration-200 ease-out',
                    seekFxRight ? 'opacity-100 scale-100' : 'opacity-0 scale-90',
                  ].join(' ')}
                >
                  <span className="text-sm font-semibold tabular-nums">+5</span>
                  <ChevronsRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* 画像 */}
        {isImage && imageMediaList.length > 0 ? (
          <div className="w-full h-full relative">
            <div ref={sliderRef} className="keen-slider h-full">
              {imageMediaList.map((media, index) => {
                const mediaIsPortrait = media.orientation === 1;
                return (
                  <div
                    key={media.media_assets_id}
                    className="keen-slider__slide h-full flex items-center justify-center"
                  >
                    <img
                      src={media.storage_key || FALLBACK_IMAGE}
                      alt={`画像 ${index + 1}`}
                      className={`${mediaIsPortrait ? 'w-full h-full object-cover' : 'w-full h-auto object-contain'}`}
                    />
                  </div>
                );
              })}
            </div>

            {imageMediaList.length > 1 && (
              <div className="absolute top-16 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm z-50">
                {currentImageIndex + 1} / {imageMediaList.length}
              </div>
            )}

            {imageMediaList.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm z-50"
                  onClick={() => instanceRef.current?.prev()}
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm z-50"
                  onClick={() => instanceRef.current?.next()}
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}
          </div>
        ) : null}

        {/* メディアなし */}
        {!isVideo && !isImage && (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <p className="text-white text-center">コンテンツが利用できません</p>
          </div>
        )}

        {/* 再生アイコン（動画のみ、通常モード） */}
        {isVideo && videoMedia && !isPlaying && !isFullscreen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 pointer-events-none">
            <Play className="h-16 w-16 text-white opacity-80" />
          </div>
        )}

        {/* 右側のアクション（通常モードのみ） */}
        <div
          className={`absolute right-4 bottom-[95px] flex flex-col space-y-6 z-50 ${isFullscreen ? 'hidden' : ''}`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <img
                src={post.creator.avatar || '/assets/no-image.svg'}
                alt={post.creator.profile_name}
                className="w-full h-full object-cover rounded-full"
                onClick={() => navigate(`/profile?username=${post.creator.username}`)}
              />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
              onClick={handleLikeClick}
            >
              <Heart className={`h-6 w-6 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </div>
            <span className="text-white text-xs font-medium">{likesCount.toLocaleString()}</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
              onClick={handleBookmarkClick}
            >
              <Bookmark
                className={`h-6 w-6 ${bookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`}
              />
            </div>
            <span className="text-white text-xs font-medium">保存</span>
          </div>

          {isVideo && videoMedia && (
            <div className="flex flex-col items-center space-y-2">
              <div
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-6 w-6 text-white" />
                ) : (
                  <Volume2 className="h-6 w-6 text-white" />
                )}
              </div>
              <span className="text-white text-xs font-medium">
                {isMuted ? 'ミュート' : '音声'}
              </span>
            </div>
          )}

          {isVideo && videoMedia && (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={handleFullscreenClick}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleFullscreenClick(e as any);
                }}
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors active:bg-white/40"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5 text-white" />
                ) : (
                  <Maximize className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* 左下（通常モードのみ） */}
        <div
          className={`absolute bottom-[75px] left-0 right-20 flex flex-col space-y-2 z-40 ${isFullscreen ? 'hidden' : ''} ${isImage ? 'mb-4' : ''}`}
        >
          <div className="px-4 flex flex-col space-y-2">
            {!isPurchased &&
              ((post.sale_info.price?.price !== null &&
                post.sale_info.price?.price !== undefined &&
                !(isImage && post.sale_info.price.price === 0)) ||
                (post.sale_info.plans && post.sale_info.plans.length > 0)) && (
                <div className="w-fit flex flex-col items-start gap-1">
                  {(post.sale_info.price?.is_time_sale_active ||
                    post.sale_info.plans.some((plan) => plan.is_time_sale_active)) && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold leading-none shadow">
                      <Tags className="h-4 w-4" />
                      セール中
                    </div>
                  )}

                  <Button
                    className="w-fit flex items-center bg-primary/70 text-white text-xs font-bold my-0 h-8 py-1 px-3"
                    onClick={handlePurchaseClick}
                  >
                    {isVideo ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                    <span>
                      {post.sale_info.price?.price === 0
                        ? isVideo
                          ? `本編(${formatTime(post.post_main_duration)})を見る（無料）`
                          : ''
                        : isVideo
                          ? `本編(${formatTime(post.post_main_duration)})を見る`
                          : '画像を購入する'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

            <div className="flex items-center space-x-3">
              <div>
                <p className="text-white font-semibold text-sm flex items-center gap-1">
                  {post.creator.profile_name}
                  {post.creator.official && (
                    <span className="ml-1">
                      <OfficalBadge />
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-300">@{post.creator.username}</p>
              </div>
            </div>

            {post.description && (
              <div className="space-y-1">
                <div
                  ref={descRef}
                  className={[
                    'text-white text-sm leading-relaxed whitespace-pre-line',
                    !isDescriptionExpanded
                      ? 'line-clamp-1 overflow-hidden'
                      : 'max-h-52 overflow-y-auto custom-scrollbar',
                  ].join(' ')}
                >
                  {post.description}
                </div>

                {canExpand && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDescriptionExpanded((v) => !v);
                    }}
                    className="text-white/80 text-xs hover:text-white underline whitespace-nowrap"
                  >
                    {isDescriptionExpanded ? '折りたたむ' : 'もっと見る'}
                  </button>
                )}
              </div>
            )}

            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <span
                    key={category.id}
                    className="text-white text-xs bg-white/20 px-2 py-1 rounded cursor-pointer hover:bg-white/30 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/ranking/posts/detail', {
                        state: { category: category.name, category_id: category.id },
                      });
                    }}
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {isVideo && videoMedia && duration > 0 && (
            <div className="px-4 pb-4">
              <div className="px-2 py-1 bg-primary/50 w-fit text-white text-md tabular-nums rounded-md mb-2">
                <span>
                  {isPurchased ? '本編：' : 'サンプル：'}
                  {formatTime(currentTime)}/{formatTime(duration)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* プログレスバー（動画のみ） */}
      {isVideo && videoMedia && duration > 0 && !isFullscreen && (
        <div className="fixed bottom-[55px] left-0 right-0 w-full z-[60] py-2 px-0">
          <div className="w-full">
            <div
              ref={barWrapRef}
              className="relative h-8 flex items-center touch-none cursor-pointer"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={
                { WebkitTouchCallout: 'none', WebkitUserSelect: 'none' } as React.CSSProperties
              }
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-1 rounded-full bg-white/20" />
              </div>

              <div className="absolute inset-0 flex items-center">
                <div
                  className="h-1.5 rounded-full bg-white/35"
                  style={{ width: `${bufferedPct}%` }}
                />
              </div>

              <div className="absolute inset-0 flex items-center">
                <div className="h-1.5 rounded-full bg-white" style={{ width: `${progressPct}%` }} />
              </div>

              <div
                className="absolute bottom-0 -translate-y-1/2 h-4 w-4 rounded-full bg-primary shadow-lg z-[100]"
                style={{ left: `calc(${progressPct}% - 8px)` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
