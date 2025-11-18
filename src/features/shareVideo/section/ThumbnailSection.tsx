import React from 'react';
import { Label } from '@/components/ui/label';
import { ImageIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThumbnailSectionProps {
  thumbnail: string | null;
  uploadProgress: number;
  onThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export default function ThumbnailSection({
  thumbnail,
  uploadProgress,
  onThumbnailChange,
  onRemove,
}: ThumbnailSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <Label htmlFor="thumbnail" className="text-sm font-medium font-bold">
        <span className="text-primary mr-1">*</span>サムネイル画像を設定する
      </Label>
      <div className="space-y-4">
        {thumbnail ? (
          <div className="relative border-2 rounded-md overflow-hidden">
            <div className="w-full h-48 bg-black flex items-center justify-center">
              <img
                src={thumbnail}
                alt="サムネイル"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* 右上の画像変更アイコンボタン */}
            <button
              type="button"
              onClick={() => document.getElementById('thumbnail-upload-change')?.click()}
              className={cn(
                'absolute top-2 right-2 bg-white text-gray-600 hover:text-primary',
                'rounded-full p-2 shadow-md transition'
              )}
            >
              <ImageIcon className="w-5 h-5" />
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
              type="file"
              accept="image/*"
              onChange={onThumbnailChange}
              className="hidden"
              id="thumbnail-upload-change"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500 mb-4">サムネイルを選択して下さい。</p>
            <input
              type="file"
              accept="image/*"
              onChange={onThumbnailChange}
              className="hidden"
              id="thumbnail-upload"
            />
            <label
              htmlFor="thumbnail-upload"
              className="inline-block bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90"
            >
              画像を選択
            </label>
          </div>
        )}
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
      <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1 mt-2">
        <li>推奨サイズは500x500ピクセルです。</li>
      </ul>
    </div>
  );
}
