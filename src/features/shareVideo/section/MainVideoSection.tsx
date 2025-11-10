import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import ThumbnailPreview from '@/features/shareVideo/componets/ThumbnailPreview';
import MainStreemUploadArea from '@/components/common/MainStreemUploadArea';
import { MainVideoSectionProps } from '@/features/shareVideo/types';

export default function MainVideoSection({
  selectedMainFile,
  previewMainUrl,
  thumbnail,
  uploading,
  uploadProgress,
  uploadMessage,
  isUploadingMainVideo = false,
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
            <div className="flex flex-col items-center gap-4">
              {/* 円形プログレスバー */}
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 animate-spin">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#ec4899"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="40 140"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600 font-medium">動画をアップロード中...</p>
            </div>
          </div>
        ) : previewMainUrl ? (
          <div className="relative">
            <video ref={videoRef} controls className="w-full rounded-md shadow-md" />
            {/* 動画変更ボタン */}
            <div className="absolute top-4 right-4 flex gap-2">
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

      {/* サムネイル画像（アップロードエリア風） */}
      {previewMainUrl && (
        <div className="flex items-center space-x-4 p-5">
          {thumbnail ? (
            <ThumbnailPreview
              thumbnail={thumbnail}
              onRemove={() => {}}
              onChange={onThumbnailChange}
            />
          ) : selectedMainFile ? (
            <div className="text-sm text-gray-500">サムネイルを生成中...</div>
          ) : (
            <div className="text-sm text-gray-500">サムネイルを設定してください</div>
          )}
        </div>
      )}

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
