import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ImageUploadArea from "@/features/shareVideo/componets/ImageUploadArea";
import ThumbnailPreview from "@/features/shareVideo/componets/ThumbnailPreview";
import ImagePreview from "@/features/shareVideo/componets/ImagePreview";
import { ImagePostSectionProps } from '@/features/shareVideo/types';

export default function ImagePostSection({
  selectedImages,
  uploading,
  uploadProgress,
  uploadMessage,
  onFileChange,
  onRemove,
  existingImages = [],
  onRemoveExistingImage,
}: ImagePostSectionProps) {
  return (
    <div className="space-y-4 pr-5 pl-5 bg-white border-t bg-white border-b border-primary pt-5 pb-5">
      <label htmlFor="images-upload" className="text-sm font-medium font-bold">
        <span className="text-primary mr-1">*</span>画像を選択
      </label>

      {/* 既存画像の表示 */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">現在の画像 ({existingImages.length}枚)</p>
          <div className="grid grid-cols-3 gap-2">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={imageUrl}
                  alt={`既存画像 ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">
                  既存
                </div>
                {/* 削除ボタン */}
                {onRemoveExistingImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveExistingImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedImages.length > 0 ? (
        <ImagePreview images={selectedImages} onRemove={onRemove} />
      ) : existingImages.length === 0 ? (
        <ImageUploadArea onFileChange={onFileChange} />
      ) : null}

      {(selectedImages.length > 0 || existingImages.length > 0) && (
        <div className="mt-4">
          <ImageUploadArea onFileChange={onFileChange} />
          {existingImages.length > 0 && selectedImages.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              新しい画像を追加すると、既存の画像と一緒に表示されます
            </p>
          )}
        </div>
      )}

      
      

      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress.images || 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{uploadMessage}</p>
        </div>
      )}

      <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1 mt-2">
        <li>JPEG、PNG、WebP形式の画像をアップロードできます。</li>
        <li>1枚あたり最大10MBまでアップロード可能です。</li>
        <li>複数の画像を選択して投稿できます。</li>
        <li>設定すると審査対象となり、利用規約違反があった場合は、予告なくアカウントが凍結される可能性があります。</li>
      </ul>
    </div>
  );
}
