import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VideoTrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  onComplete: (startTime: number, endTime: number) => void;
  maxDuration?: number; // 最大切り取り時間（秒）デフォルト300秒（5分）
}

export default function VideoTrimModal({
  isOpen,
  onClose,
  videoUrl,
  onComplete,
  maxDuration = 300,
}: VideoTrimModalProps) {
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // モーダルが開いた時に状態をリセット
  useEffect(() => {
    if (isOpen) {
      setIsVideoLoading(true);
      setLoadingProgress(0);
      setVideoDuration(0);
      setStartTime(0);
      setEndTime(0);
      setError('');
    }
  }, [isOpen]);

  // 動画の長さを取得
  useEffect(() => {
    if (videoRef.current && videoUrl && isOpen) {
      const video = videoRef.current;

      const handleProgress = () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const duration = video.duration;
          if (duration > 0) {
            const percent = Math.round((bufferedEnd / duration) * 100);
            setLoadingProgress(percent);
          }
        }
      };

      const handleLoadedMetadata = () => {
        const duration = video.duration;
        setVideoDuration(duration);
        setEndTime(Math.min(duration, maxDuration)); // 初期値
      };

      const handleCanPlay = () => {
        setIsVideoLoading(false);
        setLoadingProgress(100);
      };

      const handleError = (e: Event) => {
        setError('動画の読み込みに失敗しました');
        setIsVideoLoading(false);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('progress', handleProgress);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      // 動画を強制的に再読み込み
      video.load();

      // 既に読み込まれている場合
      if (video.readyState >= 1) {
        handleLoadedMetadata();
      }
      if (video.readyState >= 3) {
        handleCanPlay();
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('progress', handleProgress);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, [videoUrl, maxDuration, isOpen]);

  // 時間を MM:SS 形式に変換
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // MM:SS 形式から秒数に変換
  const parseTime = (timeString: string): number => {
    const parts = timeString.split(':');
    if (parts.length !== 2) return 0;
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  };

  // マウス/タッチ位置から時間を計算
  const getTimeFromPosition = (clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    return percentage * videoDuration;
  };

  // ドラッグ開始（マウス）
  const handleMouseDown = (e: React.MouseEvent, handle: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(handle);
  };

  // ドラッグ開始（タッチ）
  const handleTouchStart = (e: React.TouchEvent, handle: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(handle);
  };

  // ドラッグ中（マウス・タッチ共通処理）
  useEffect(() => {
    if (!isDragging) return;

    const updateTimeFromPosition = (clientX: number) => {
      const newTime = getTimeFromPosition(clientX);

      if (isDragging === 'start') {
        if (newTime < endTime && newTime >= 0) {
          setStartTime(newTime);
          if (videoRef.current) {
            videoRef.current.currentTime = newTime;
          }
        }
      } else if (isDragging === 'end') {
        if (newTime > startTime && newTime <= videoDuration) {
          const duration = newTime - startTime;
          if (duration <= maxDuration) {
            setEndTime(newTime);
            if (videoRef.current) {
              videoRef.current.currentTime = newTime;
            }
            setError('');
          } else {
            setError(`サンプル動画は${Math.floor(maxDuration / 60)}分以内にしてください`);
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateTimeFromPosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateTimeFromPosition(e.touches[0].clientX);
      }
    };

    const handleEnd = () => {
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, startTime, endTime, videoDuration, maxDuration]);

  // 入力フィールドからの時間変更
  const handleStartTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseTime(e.target.value);
    if (newTime < endTime && newTime >= 0) {
      setStartTime(newTime);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
      }
    }
  };

  const handleEndTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseTime(e.target.value);
    if (newTime > startTime && newTime <= videoDuration) {
      const duration = newTime - startTime;
      if (duration <= maxDuration) {
        setEndTime(newTime);
        if (videoRef.current) {
          videoRef.current.currentTime = newTime;
        }
        setError('');
      } else {
        setError(`サンプル動画は${Math.floor(maxDuration / 60)}分以内にしてください`);
      }
    }
  };

  // 動画の再生位置を監視
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= endTime) {
      videoRef.current.pause();
      videoRef.current.currentTime = startTime;
    }
  };

  // 完了ボタン
  const handleComplete = () => {
    if (endTime <= startTime) {
      setError('終了時間は開始時間より後にしてください');
      return;
    }
    const duration = endTime - startTime;
    if (duration > maxDuration) {
      setError(`サンプル動画は${Math.floor(maxDuration / 60)}分以内にしてください`);
      return;
    }
    onComplete(startTime, endTime);
    onClose();
  };

  if (!isOpen) return null;

  const startPercent = videoDuration > 0 ? (startTime / videoDuration) * 100 : 0;
  const endPercent = videoDuration > 0 ? (endTime / videoDuration) * 100 : 100; // デフォルト100%
  const rangeWidth = endPercent - startPercent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="border-b pb-3">
          <h2 className="text-lg font-bold text-center">サンプル動画を編集</h2>
        </div>

        {/* 動画プレビュー */}
        <div className="flex justify-center relative">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onTimeUpdate={handleVideoTimeUpdate}
            className={`w-full max-h-80 rounded-md border border-gray-300 ${isVideoLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{ transition: 'opacity 0.3s' }}
          />

          {/* ローディング表示 */}
          {isVideoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
              <div className="flex flex-col items-center gap-4">
                {/* 円形プログレスバー */}
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    {/* 背景の円 */}
                    <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    {/* プログレスの円 */}
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#ec4899"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - loadingProgress / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.3s' }}
                    />
                  </svg>
                  {/* パーセンテージ表示 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">{loadingProgress}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">動画を読み込み中...</p>
              </div>
            </div>
          )}
        </div>

        {/* レンジスライダー */}
        <div className={`space-y-2 px-4 ${isVideoLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* ツールチップ（上部） */}
          <div className="relative h-8">
            <div
              className="absolute bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
              style={{ left: `${startPercent}%`, transform: 'translateX(-50%)' }}
            >
              {formatTime(startTime)}
            </div>
            <div
              className="absolute bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
              style={{ left: `${endPercent}%`, transform: 'translateX(-50%)' }}
            >
              {formatTime(endTime)}
            </div>
          </div>

          {/* スライダー本体 */}
          <div
            ref={containerRef}
            className="relative h-2 bg-gray-300 rounded-full cursor-pointer"
            style={{ minHeight: '8px' }}
          >
            {/* 選択範囲 */}
            <div
              className="absolute h-2 bg-primary rounded-full pointer-events-none"
              style={{
                left: `${startPercent}%`,
                width: `${rangeWidth}%`,
                top: 0,
              }}
            />

            {/* 開始ハンドル */}
            <div
              className="absolute cursor-grab active:cursor-grabbing touch-none"
              style={{
                left: `${startPercent}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
              }}
              onMouseDown={(e) => handleMouseDown(e, 'start')}
              onTouchStart={(e) => handleTouchStart(e, 'start')}
            >
              <div
                className="bg-primary rounded-full border-2 border-white shadow-lg"
                style={{ width: '20px', height: '20px' }}
              />
            </div>

            {/* 終了ハンドル */}
            <div
              className="absolute cursor-grab active:cursor-grabbing touch-none"
              style={{
                left: `${endPercent}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
              }}
              onMouseDown={(e) => handleMouseDown(e, 'end')}
              onTouchStart={(e) => handleTouchStart(e, 'end')}
            >
              <div
                className="bg-primary rounded-full border-2 border-white shadow-lg"
                style={{ width: '20px', height: '20px' }}
              />
            </div>
          </div>

          {/* 時間表示（下部） */}
          <div className="relative h-6 text-sm text-gray-600">
            <div
              className="absolute"
              style={{ left: `${startPercent}%`, transform: 'translateX(-50%)' }}
            >
              {formatTime(startTime)}
            </div>
            <div
              className="absolute"
              style={{ left: `${endPercent}%`, transform: 'translateX(-50%)' }}
            >
              {formatTime(endTime)}
            </div>
          </div>
        </div>

        {/* 時間入力フィールド */}
        <div
          className={`flex items-center justify-center gap-4 px-4 ${isVideoLoading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Input
            type="text"
            value={formatTime(startTime)}
            onChange={handleStartTimeInputChange}
            placeholder="00:00"
            className="w-32 text-center"
          />
          <span className="text-gray-500">〜</span>
          <Input
            type="text"
            value={formatTime(endTime)}
            onChange={handleEndTimeInputChange}
            placeholder="00:00"
            className="w-32 text-center"
          />
        </div>

        {/* エラーメッセージ */}
        {error && <p className="text-sm text-red-500 text-center px-4">{error}</p>}

        {/* サンプル時間表示 */}
        <div className="text-center text-sm text-gray-600">
          サンプル時間: {formatTime(endTime - startTime)}
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pt-4 px-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 text-primary border-primary hover:bg-primary/10"
          >
            キャンセル
          </Button>
          <Button
            variant="default"
            onClick={handleComplete}
            disabled={isVideoLoading}
            className="flex-1 bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            完了
          </Button>
        </div>
      </div>
    </div>
  );
}
