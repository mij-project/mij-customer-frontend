import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import SampleStreemUploadArea from '@/features/shareVideo/componets/SampleStreemUploadArea';
import ThumbnailPreview from '@/features/shareVideo/componets/ThumbnailPreview';
import { SampleVideoSectionProps } from '@/features/shareVideo/types';

export default function SampleVideoSection({
  isSample,
  previewSampleUrl,
  sampleDuration,
  sampleStartTime = 0,
  sampleEndTime = 0,
  onSampleTypeChange,
  onFileChange,
  onRemove,
  onEdit,
}: SampleVideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // 秒数をMM:SS形式に変換
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // HLS動画の初期化
  useEffect(() => {
    if (!videoRef.current || !previewSampleUrl) return;

    const videoElement = videoRef.current;

    if (previewSampleUrl.endsWith('.m3u8')) {
      // HLS形式の動画
      if (Hls.isSupported()) {
        // 既存のHLSインスタンスがあれば破棄
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls();
        hls.loadSource(previewSampleUrl);
        hls.attachMedia(videoElement);
        hlsRef.current = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari などネイティブHLSサポート
        videoElement.src = previewSampleUrl;
      }
    } else {
      // 通常の動画形式
      videoElement.src = previewSampleUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [previewSampleUrl]);

  return (
    <div className="space-y-2 pr-5 pl-5 bg-white border-t  border-primary pt-5 pb-5">
      <Label htmlFor="sample-video" className="text-sm font-medium font-bold">
        <span className="text-primary mr-1">*</span>サンプル動画を設定する
      </Label>

      <RadioGroup
        defaultValue="upload"
        onValueChange={(value) => onSampleTypeChange(value as 'upload' | 'cut_out')}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="upload" id="sample-upload" />
          <Label htmlFor="sample-upload">サンプルから動画をアップロード</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cut_out" id="sample-cut_out" />
          <Label htmlFor="sample-cut_out">本編動画から指定</Label>
        </div>
      </RadioGroup>

      <div className="flex items-center bg-secondary rounded-md space-x-4 p-5">
        {/* サンプル動画をアップロード */}
        {isSample === 'upload' && (
          <div className="flex flex-col rounded-md p-2 items-center justify-center w-full space-y-2">
            {previewSampleUrl ? (
              <div className="flex flex-col rounded-md p-2 items-center justify-center w-full space-y-2">
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="text-sm font-medium font-bold">再生時間: {sampleDuration}</span>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" className="text-xs" onClick={onRemove}>
                      削除
                    </Button>
                    <label className="cursor-pointer">
                      <Button variant="secondary" size="sm" className="text-xs" asChild>
                        <span>変更</span>
                      </Button>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={onFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <video ref={videoRef} controls />
              </div>
            ) : (
              <div className="flex flex-col border border-primary rounded-md p-2 items-center justify-center w-full space-y-2">
                <SampleStreemUploadArea onFileChange={onFileChange} />
                <span className="text-sm font-medium font-bold text-primary">
                  サンプル動画をアップロード
                </span>
                <p className="text-xs text-muted-foreground">
                  ファイル容量500MBまで、最長5分の動画がアップロード可能です。
                </p>
              </div>
            )}
          </div>
        )}

        {isSample === 'cut_out' && (
          <div className="flex flex-col w-full space-y-2">
            {previewSampleUrl ? (
              // サンプル動画が設定されている場合
              <div className="flex flex-col rounded-md p-2 items-center justify-center w-full space-y-2">
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium font-bold">再生時間: {sampleDuration}</span>
                    <span className="text-xs text-gray-600">
                      開始時間: {formatTime(sampleStartTime)} / 終了時間: {formatTime(sampleEndTime)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" className="text-xs" onClick={onRemove}>
                      削除
                    </Button>
                    <Button variant="secondary" size="sm" className="text-xs" onClick={onEdit}>
                      編集
                    </Button>
                  </div>
                </div>
                <video ref={videoRef} controls className="w-full" />
              </div>
            ) : (
              // サンプル動画が未設定の場合
              <div className="flex items-center w-full justify-between space-x-2">
                <Label htmlFor="sample-cut_out" className="text-sm font-medium font-bold">
                  <span className="text-primary mr-1">*</span>サンプル動画を設定する
                </Label>
                <Button variant="default" size="sm" className="text-xs" onClick={onEdit}>
                  編集
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
