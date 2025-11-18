import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import Hls from 'hls.js';

interface CustomVideoPlayerProps {
  videoUrl: string;
  className?: string;
  externalVideoRef?: React.RefObject<HTMLVideoElement>; // 外部からvideoRefを渡せるように
  startTime?: number; // 再生開始時間（秒）
  endTime?: number; // 再生終了時間（秒）
}

export default function CustomVideoPlayer({
  videoUrl,
  className = '',
  externalVideoRef,
  startTime = 0,
  endTime,
}: CustomVideoPlayerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef; // 外部refがあればそれを使用、なければ内部ref
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true); // モバイル用コントロール表示状態
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // HLS動画の初期化
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    const videoElement = videoRef.current;

    if (videoUrl.endsWith('.m3u8')) {
      // HLS形式の動画
      if (Hls.isSupported()) {
        // 既存のHLSインスタンスがあれば破棄
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoElement);
        hlsRef.current = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari などネイティブHLSサポート
        videoElement.src = videoUrl;
      }
    } else {
      // 通常の動画形式
      videoElement.src = videoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [videoUrl]);

  // 再生時間の更新
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentVideoTime = video.currentTime;

      // 範囲制限がある場合
      if (endTime !== undefined) {
        // 終了時間を超えた場合
        if (currentVideoTime >= endTime) {
          video.pause();
          video.currentTime = startTime;
          setIsPlaying(false);
          setCurrentTime(startTime);
          setProgress(((startTime - startTime) / (endTime - startTime)) * 100);
          return;
        }

        // 開始時間より前の場合
        if (currentVideoTime < startTime) {
          video.currentTime = startTime;
          setCurrentTime(startTime);
          setProgress(0);
          return;
        }

        // 範囲内の場合、範囲内での進捗を表示
        setCurrentTime(currentVideoTime);
        setProgress(((currentVideoTime - startTime) / (endTime - startTime)) * 100);
      } else {
        // 範囲制限がない場合（通常の動作）
        setCurrentTime(currentVideoTime);
        setProgress((currentVideoTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);

      // 範囲制限がある場合、開始位置に移動
      if (startTime > 0) {
        video.currentTime = startTime;
        setCurrentTime(startTime);
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
    };
  }, [startTime, endTime]);

  // コントロールの自動非表示
  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setShowControls(true);

    // 再生中のみ3秒後に自動非表示
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // ビデオタップ時の処理
  const handleVideoClick = () => {
    // コントロールが非表示の場合は表示
    if (!showControls) {
      hideControlsAfterDelay();
    } else {
      togglePlay();
    }
  };

  // 再生/一時停止
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      hideControlsAfterDelay();
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true); // 一時停止時は常に表示
    }
  };

  // ミュート切り替え
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  // プログレスバーの位置から時間を計算する共通関数
  const calculateTimeFromPosition = (clientX: number): number | null => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return null;

    const rect = progressBar.getBoundingClientRect();
    const positionX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = positionX / rect.width;

    // 範囲制限がある場合、範囲内での時間を計算
    if (endTime !== undefined) {
      return startTime + percentage * (endTime - startTime);
    } else {
      return percentage * video.duration;
    }
  };

  // プログレスバーのクリック処理
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const newTime = calculateTimeFromPosition(e.clientX);
    if (newTime !== null && videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // タッチ開始時の処理
  const handleProgressBarTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const newTime = calculateTimeFromPosition(e.touches[0].clientX);
      if (newTime !== null && videoRef.current) {
        videoRef.current.currentTime = newTime;
      }
    }
  };

  // タッチ移動時の処理
  const handleProgressBarTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // スクロールを防止
    if (e.touches.length > 0) {
      const newTime = calculateTimeFromPosition(e.touches[0].clientX);
      if (newTime !== null && videoRef.current) {
        videoRef.current.currentTime = newTime;
      }
    }
  };

  // 時間をフォーマット
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative group ${className}`}>
      {/* ビデオ要素 */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={handleVideoClick}
        onTouchStart={hideControlsAfterDelay}
        playsInline
        preload="metadata"
      />

      {/* カスタムコントロール */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        } md:opacity-0 md:group-hover:opacity-100`}
      >
        {/* プログレスバー（親要素いっぱい） */}
        <div
          ref={progressBarRef}
          className="relative w-full py-2 mb-3 cursor-pointer"
          onClick={handleProgressBarClick}
          onTouchStart={handleProgressBarTouchStart}
          onTouchMove={handleProgressBarTouchMove}
        >
          {/* 実際のプログレスバー（細い） */}
          <div className="relative w-full h-0.5 bg-gray-600/50 rounded-full">
            {/* バッファリング済み部分 */}
            <div
              className="absolute top-0 left-0 h-full bg-gray-400/50 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* 再生済み部分 */}
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* 現在位置のドット */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </div>

        {/* コントロールボタン */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            {/* 再生/一時停止ボタン */}
            <button onClick={togglePlay} className="hover:text-primary transition-colors">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* ミュートボタン */}
            <button onClick={toggleMute} className="hover:text-primary transition-colors">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* 時間表示 */}
            <span className="text-sm">
              {endTime !== undefined
                ? `${formatTime(currentTime - startTime)} / ${formatTime(endTime - startTime)}`
                : `${formatTime(currentTime)} / ${formatTime(duration)}`}
            </span>
          </div>
        </div>
      </div>

      {/* 中央の再生ボタン（動画が停止中のみ表示） */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
            <Play size={40} className="text-black" />
          </div>
        </div>
      )}
    </div>
  );
}
