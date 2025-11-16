import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import ThumbnailSection from '@/features/shareVideo/section/ThumbnailSection';
import MainStreemUploadArea from '@/components/common/MainStreemUploadArea';
import CustomVideoPlayer from '@/features/shareVideo/componets/CustomVideoPlayer';
import { MainVideoSectionProps } from '@/features/shareVideo/types';

export default function MainVideoSection({
  selectedMainFile,
  previewMainUrl,
  thumbnail,
  uploading,
  uploadProgress,
  uploadMessage,
  isUploadingMainVideo = false,
  uploadingProgress = 0,
  onFileChange,
  onThumbnailChange,
  onRemove,
  onUpload,
}: MainVideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // HLS動画の初期化
  useEffect(() => {
    if (!videoRef.current || !previewMainUrl) return;

    const videoElement = videoRef.current;

    if (previewMainUrl.endsWith('.m3u8')) {
      // HLS形式の動画
      if (Hls.isSupported()) {
        // 既存のHLSインスタンスがあれば破棄
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls();
        hls.loadSource(previewMainUrl);
        hls.attachMedia(videoElement);
        hlsRef.current = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari などネイティブHLSサポート
        videoElement.src = previewMainUrl;
      }
    } else {
      // 通常の動画形式
      videoElement.src = previewMainUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [previewMainUrl]);

  return (
    <div className="bg-white border-b border-gray-200">
      {/* プレビュー表示 */}
      <div className="w-full relative">
        {isUploadingMainVideo ? (
          /* ローディング表示 */
          <div className="flex items-center justify-center py-20 bg-gray-50">
            <div className="flex flex-col items-center gap-4 w-full max-w-md px-4">
              <p className="text-sm text-gray-600 font-medium">動画をアップロード中...</p>

              {/* プログレスバー */}
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${uploadingProgress}%` }}
                  >
                    {uploadingProgress > 10 && (
                      <span className="text-[10px] text-white font-bold">
                        {Math.round(uploadingProgress)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">進捗状況</span>
                  <span className="text-xs text-gray-700 font-semibold">
                    {Math.round(uploadingProgress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : previewMainUrl ? (
          <div className="relative">
            {/* 固定高さのコンテナ */}
            <div className="w-full h-[300px] bg-black">
              <CustomVideoPlayer videoUrl={previewMainUrl} className="w-full h-full" />
            </div>
            {/* 動画変更ボタン */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                onClick={onRemove}
                variant="destructive"
                size="sm"
                className="bg-red-500 hover:bg-red-600"
              >
                削除
              </Button>
              <label className="cursor-pointer">
                <Button variant="secondary" size="sm" asChild>
                  <span>変更</span>
                </Button>
                <input type="file" accept="video/*" onChange={onFileChange} className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <div className="pr-5 pl-5 bg-white border-t bg-white border-b border-primary pt-5 pb-5">
            <label htmlFor="video-upload" className="text-sm font-medium font-bold">
              <span className="text-primary mr-1">*</span>動画を選択
            </label>
            <MainStreemUploadArea onFileChange={onFileChange} />
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1 mt-2">
              <li>最大20GBまでアップロード可能です。</li>
            </ul>
          </div>
        )}
      </div>

      {/* サムネイル画像（ThumbnailSectionコンポーネントを使用） - 常に表示 */}
      <div className="p-5 border-t border-gray-200">
        <ThumbnailSection
          thumbnail={thumbnail}
          uploadProgress={uploadProgress.thumbnail}
          onThumbnailChange={onThumbnailChange}
          onRemove={() => {}}
        />
      </div>

      {/* アップロード処理 */}
      {selectedMainFile && onUpload && (
        <div className="space-y-4 p-5 border-t border-primary pt-5">
          <Button
            onClick={onUpload}
            disabled={uploading}
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            {uploading ? 'アップロード中...' : '動画をアップロード'}
          </Button>

          {/* プログレスバー */}
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.main || 0}%` }}
              />
            </div>
          )}

          {/* アップロードメッセージ */}
          {uploadMessage && (
            <div
              className={`p-3 rounded-md text-sm ${
                uploadMessage.includes('完了')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-green-200'
              }`}
            >
              {uploadMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
