import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import SampleStreemUploadArea from '@/features/shareVideo/componets/SampleStreemUploadArea';
import ThumbnailPreview from '@/features/shareVideo/componets/ThumbnailPreview';
import CustomVideoPlayer from '@/features/shareVideo/componets/CustomVideoPlayer';
import { SampleVideoSectionProps } from '@/features/shareVideo/types';
import { Video, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SampleVideoSection({
  isSample,
  previewSampleUrl,
  sampleDuration,
  sampleStartTime = 0,
  sampleEndTime = 0,
  isGeneratingSample = false,
  sampleGenerationProgress = 0,
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
        value={isSample}
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

      <div className="flex items-center bg-secondary rounded-md space-x-4 p-2">
        {/* サンプル動画をアップロード */}
        {isSample === 'upload' && (
          <div className="flex flex-col rounded-md p-2 items-center justify-center w-full space-y-2">
            {previewSampleUrl ? (
              <div className="flex flex-col rounded-md p-2 items-center justify-center w-full space-y-2">
                <div className="flex items-center justify-between w-full gap-2 mb-2">
                  <span className="text-sm font-medium font-bold">再生時間: {sampleDuration}</span>
                </div>
                {/* 固定高さのコンテナ */}
                <div className="w-full h-[250px] bg-black relative border-2 rounded-md overflow-hidden">
                  <CustomVideoPlayer videoUrl={previewSampleUrl} className="w-full h-full" />

                  {/* 右上の動画変更アイコンボタン */}
                  <button
                    type="button"
                    onClick={() => document.getElementById('sample-video-change')?.click()}
                    className={cn(
                      'absolute top-2 right-2 bg-white text-gray-600 hover:text-primary',
                      'rounded-full p-2 shadow-md transition'
                    )}
                  >
                    <Video className="w-5 h-5" />
                  </button>

                  {/* 削除ボタン */}
                  <button
                    type="button"
                    onClick={onRemove}
                    className={cn(
                      'absolute top-2 right-14 bg-white text-red-600 hover:text-red-700',
                      'rounded-full p-2 shadow-md transition'
                    )}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  {/* 非表示のファイル入力 */}
                  <input
                    id="sample-video-change"
                    type="file"
                    accept="video/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                </div>
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
            {isGeneratingSample ? (
              /* サンプル動画生成中 */
              <div className="flex items-center justify-center py-10 bg-gray-50 rounded-md">
                <div className="flex flex-col items-center gap-4 w-full max-w-md px-4">
                  <p className="text-sm text-gray-600 font-medium">メイン動画から切り取り中...</p>

                  {/* プログレスバー */}
                  <div className="w-full">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                        style={{ width: `${sampleGenerationProgress}%` }}
                      >
                        {sampleGenerationProgress > 10 && (
                          <span className="text-[10px] text-white font-bold">
                            {Math.round(sampleGenerationProgress)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">進捗状況</span>
                      <span className="text-xs text-gray-700 font-semibold">
                        {Math.round(sampleGenerationProgress)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : sampleDuration ? (
              // サンプル動画が設定されている場合（プレビューなし、時間情報のみ）
              <div className="flex flex-col rounded-md p-4 bg-gray-50 w-full space-y-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">開始時間:</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {formatTime(sampleStartTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">終了時間:</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {formatTime(sampleEndTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">再生時間:</span>
                      <span className="text-sm font-semibold text-primary">{sampleDuration}</span>
                    </div>
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
