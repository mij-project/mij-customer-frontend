import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Play,
  ArrowLeft,
  Video,
  ArrowRight,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Share2,
} from 'lucide-react';
import Hls from 'hls.js';
import { PostDetailData, MediaInfo } from '@/api/types/post';
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

interface VerticalVideoCardProps {
  post: PostDetailData;
  isActive: boolean;
  onVideoClick: () => void;
  onPurchaseClick: () => void;
  onAuthRequired?: () => void;
}

const FALLBACK_IMAGE = NoImageSvg;

export default function VerticalVideoCard({
  post,
  isActive,
  onVideoClick,
  onPurchaseClick,
  onAuthRequired,
}: VerticalVideoCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullSize, setIsFullSize] = useState(false); // フルサイズ表示用
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // 初期表示時はミュート
  const [isLandscape, setIsLandscape] = useState(false); // 画面の向き（横向きかどうか）
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false); // 説明文の展開状態
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const barWrapRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // 動画/画像判定
  const isVideo = post.post_type === 1;
  const isImage = post.post_type === 2;

  // メディア情報を取得
  const videoMedia = isVideo ? post.media_info.find((m) => m.kind === 5) : null; // kind=5がサンプル動画
  const imageMediaList = isImage ? post.media_info.filter((m) => m.kind === 3) : []; // kind=3が画像
  const mainMedia = post.media_info[0];
  const isPortrait = mainMedia?.orientation === 1;

  // 画像スライダー用
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    slides: {
      perView: 1,
      spacing: 0,
    },
    slideChanged(slider) {
      setCurrentImageIndex(slider.track.details.rel);
    },
  });

  // いいね・ブックマーク状態の取得
  useEffect(() => {
    const fetchSocialStatus = async () => {
      // ログインしている場合のみ状態を取得
      if (!user) {
        return;
      }
      try {
        // いいね状態を取得
        const likeResponse = await getLikeStatus(post.id);
        setLiked(likeResponse.data.liked);
        setLikesCount(likeResponse.data.likes_count);

        // ブックマーク状態を取得
        const bookmarkResponse = await getBookmarkStatus(post.id);
        setBookmarked(bookmarkResponse.data.bookmarked);
      } catch (error) {
        console.error('Failed to fetch social status:', error);
      }
    };

    fetchSocialStatus();
  }, [post.id, user]);

  // いいねトグル処理
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // 未ログインの場合はAuthDialogを表示
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      }
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

  // ブックマークトグル処理
  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // 未ログインの場合はAuthDialogを表示
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }
    try {
      const response = await toggleBookmark(post.id);
      setBookmarked(response.data.bookmarked ?? !bookmarked);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  // 時間をフォーマットする関数
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 画面の向き検知
  useEffect(() => {
    const checkOrientation = () => {
      // window.innerWidthとinnerHeightで判定
      const isCurrentlyLandscape = window.innerWidth > window.innerHeight;
      setIsLandscape(isCurrentlyLandscape);
    };

    // 初期チェック
    checkOrientation();

    // orientationchangeイベントとresizeイベントの両方をリッスン
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  // バッファ終端を取得
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
      // 現在位置を含まない場合でも最大値を採用
      end = Math.max(end, ranges.end(i));
    }
    setBufferedEnd(end);
  }, []);

  // HLS セットアップ
  useEffect(() => {
    const video = videoRef.current;
    if (!isVideo || !video || !videoMedia?.storage_key) return;

    const onLoadedMetadata = () => {
      // video.duration が効くならそれを採用
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration);
      }
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

        // マニフェストから duration を拾う（VOD想定）
        hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
          const total = data?.details?.totalduration;
          if (Number.isFinite(total) && total > 0) setDuration(total);
        });

        hls.on(Hls.Events.ERROR, () => {
          /* 必要ならログ */
        });
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

  // アクティブ時の自動再生/停止
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.play().catch(() => { });
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
    onVideoClick();
  };

  // 位置→秒変換
  const posToTime = (clientX: number) => {
    const el = barWrapRef.current;
    if (!el || duration <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ratio = x / rect.width;
    return ratio * duration;
  };

  // シーク操作
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
    } catch (err) {
      // ポインターキャプチャが失敗しても続行
    }
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
    } catch (err) {
      // ポインターキャプチャの解放が失敗しても続行
    }
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  // 購入ボタンのクリック処理
  const handlePurchaseClick = (e: React.MouseEvent) => {
    console.log('handlePurchaseClick');
    e.stopPropagation();
    if (onPurchaseClick) {
      onPurchaseClick();
    }
  };

  // フルスクリーンボタンのクリック処理（ネイティブコントロール使用）
  const handleFullscreenClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const video = videoRef.current;
    if (!video) return;

    try {
      const elem = video as any;

      // ネイティブのビデオフルスクリーンに入る（プレフィックス対応）
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.webkitEnterFullscreen) {
        // iOS Safari用 - これがネイティブコントロールを表示
        elem.webkitEnterFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error('フルスクリーンエラー:', error);
    }
  };

  // フルスクリーン状態の変更を監視（プレフィックス対応）
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleFullscreenChange = () => {
      const doc = document as any;
      const vid = video as any;

      // ドキュメントレベルとビデオ要素レベルの両方でチェック
      const isCurrentlyFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement ||
        vid.webkitDisplayingFullscreen
      );

      setIsFullscreen(isCurrentlyFullscreen);
    };

    const handleWebkitEnd = () => {
      // iOS Safari用：ネイティブフルスクリーン終了を検知
      setIsFullscreen(false);
    };

    // 各ブラウザのイベントをすべて監視
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // iOS Safari専用：ネイティブフルスクリーン終了イベント
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

  // ミュートトグル処理
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `mijfans`,
          url: window.location.href,
        })
        .catch((error) => console.log('Share error:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('URLをコピーしました');
    }
  };

  return (
    <div
      ref={fullscreenContainerRef}
      className={`video-fullscreen-container ${isFullSize ? 'fixed inset-0 z-[9999]' : 'relative'} w-full bg-black flex items-center justify-center ${isFullSize ? 'h-screen' : isPortrait ? 'h-[calc(100vh-72px)]' : 'h-[calc(100vh-72px)]'}`}
    >
      <div className="absolute mt-4 w-full h-12 flex items-center justify-center max-w-md mx-auto text-white inset-0 z-[100]">
        <div className="w-12 h-12 flex justify-center hover:bg-transparent hover:text-white cursor-pointer" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 text-center"></div>
        <div className="w-12 h-12 flex justify-center hover:bg-transparent hover:text-white cursor-pointer" onClick={handleShare}>
          <Share className="h-5 w-5 text-white" />
        </div>
      </div>
      <div
        className={`relative w-full h-full flex items-center justify-center ${isFullSize || isLandscape ? '' : 'max-w-md mx-auto'}`}
      >
        {/* 動画の場合 */}
        {isVideo && videoMedia ? (
          <>
            <video
              ref={videoRef}
              className={`${isFullscreen
                ? 'w-full h-full object-contain'
                : isLandscape || isFullSize
                  ? 'w-full h-full object-contain'
                  : isPortrait
                    ? 'w-full h-full object-cover'
                    : 'w-full h-auto object-contain'
                }`}
              loop
              muted={isMuted}
              playsInline
              controls={isFullscreen}
            />
            {/* タップ可能なオーバーレイ - 下部のUI要素を避けるために上部のみ配置 */}
            <div className="absolute inset-0 z-10" style={{ bottom: '35%' }} onClick={togglePlay} />
          </>
        ) : null}

        {/* 画像の場合 */}
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

            {/* スライダーインジケーター */}
            {imageMediaList.length > 1 && (
              <div className="absolute top-16 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm z-50">
                {currentImageIndex + 1} / {imageMediaList.length}
              </div>
            )}

            {/* スライダー操作ボタン */}
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

        {/* メディアがない場合 */}
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
          className={`absolute right-4 bottom-8 flex flex-col space-y-6 z-50 ${isFullscreen ? 'hidden' : ''}`}
        >
          {/* アイコン */}
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
          {/* いいね */}
          <div className="flex flex-col items-center space-y-2">
            <div
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
              onClick={handleLikeClick}
            >
              <Heart className={`h-6 w-6 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </div>
            <span className="text-white text-xs font-medium">{likesCount.toLocaleString()}</span>
          </div>
          {/* コメント */}
          {/* <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">コメント</span>
          </div> */}
          {/* 保存 */}
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
          {/* ミュートボタン（動画のみ） */}
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
          {/* フルスクリーン表示ボタン（動画のみ） */}
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

        {/* 左下のコンテンツエリア（クリエイター情報・説明文）（通常モードのみ） */}
        <div
          className={`absolute bottom-4 left-0 right-20 flex flex-col space-y-2 z-40 ${isFullscreen ? 'hidden' : ''}`}
        >
          {/* クリエイター情報・説明文 */}
          <div className="px-4 flex flex-col space-y-2">
            {post.sale_info.price > 0 && (!user || user.id !== post.creator.user_id) && (
              <>
                <Button
                  className="w-fit flex items-center space-x-1 bg-primary text-white text-xs font-bold my-0"
                  onClick={handlePurchaseClick}
                >
                  <Video className="h-4 w-4" />
                  <span>{isVideo ? 'この動画を購入' : 'この画像を購入'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            <div className="flex items-center space-x-3">
              <div>
                <p className="text-white font-semibold text-sm">{post.creator.profile_name}</p>
                <p className="text-xs text-gray-300">@{post.creator.username}</p>
              </div>
            </div>
            {post.description && (
              <div className="space-y-1">
                <p
                  className={`text-white text-sm leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-2' : ''
                    }`}
                >
                  {post.description}
                </p>
                {post.description.length > 100 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDescriptionExpanded(!isDescriptionExpanded);
                    }}
                    className="text-white/80 text-xs hover:text-white underline"
                  >
                    {isDescriptionExpanded ? '折りたたむ' : 'もっと見る'}
                  </button>
                )}
              </div>
            )}
            {/* カテゴリータグを表示 */}
            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <span
                    key={category.id}
                    className="text-white text-xs bg-white/20 px-2 py-1 rounded"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 時間表示をプログレスバーの左上に配置（動画のみ） */}
          {isVideo && videoMedia && duration > 0 && (
            <div className="px-4 pb-4">
              <div className="px-2 py-1 bg-primary/50 w-fit text-white text-md tabular-nums rounded-md mb-2">
                <span>
                  サンプル：{formatTime(currentTime)}/{formatTime(duration)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* プログレスバー（動画のみ、画面横幅いっぱいに表示、通常モードのみ） */}
        {isVideo && videoMedia && duration > 0 && !isFullscreen && (
          <div className="absolute bottom-0 left-0 right-0 w-full z-50 pb-1">
            <div className="w-full px-2">
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
                {/* バックグラウンド（トラック） */}
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-1.5 rounded-full bg-white/20" />
                </div>
                {/* バッファ済み */}
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="h-1.5 rounded-full bg-white/35"
                    style={{ width: `${bufferedPct}%` }}
                  />
                </div>
                {/* 再生済み */}
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="h-1.5 rounded-full bg-white"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {/* ハンドル（つまみ） */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary shadow-lg"
                  style={{ left: `calc(${progressPct}% - 10px)` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
