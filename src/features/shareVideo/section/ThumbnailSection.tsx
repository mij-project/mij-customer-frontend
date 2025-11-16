import React from 'react';

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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">サムネイル画像</h3>
      <div className="space-y-4">
        {thumbnail ? (
          <div className="relative">
            <img src={thumbnail} alt="サムネイル" className="w-full h-48 object-cover rounded-lg" />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={onRemove}
                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg"
              >
                ×
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={onThumbnailChange}
                className="hidden"
                id="thumbnail-upload-change"
              />
              <label
                htmlFor="thumbnail-upload-change"
                className="bg-primary text-white rounded-md px-3 py-1 text-xs cursor-pointer hover:bg-primary/90 shadow-lg flex items-center"
              >
                変更
              </label>
            </div>
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
    </div>
  );
}
