import React from 'react';
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
}: ImagePostSectionProps) {
  return (
    <div className="space-y-4 pr-5 pl-5 bg-white border-t bg-white border-b border-primary pt-5 pb-5">
      <label htmlFor="images-upload" className="text-sm font-medium font-bold">
        <span className="text-primary mr-1">*</span>画像を選択
      </label>

      {selectedImages.length > 0 ? (
        <ImagePreview images={selectedImages} onRemove={onRemove} />
      ) : (
        <ImageUploadArea onFileChange={onFileChange} />
      )}

      {selectedImages.length > 0 && (
        <div className="mt-4">
          <ImageUploadArea onFileChange={onFileChange} />
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
