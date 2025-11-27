import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  images: File[];
  onRemove: (index: number) => void;
  onImageClick?: (imageUrl: string) => void;
}

export default function ImagePreview({ images, onRemove, onImageClick }: ImagePreviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image, index) => {
        const imageUrl = URL.createObjectURL(image);
        return (
        <div key={index} className="relative">
          <img
            src={imageUrl}
            alt={`Preview ${index + 1}`}
            className="w-full h-32 object-cover rounded-md cursor-pointer"
            onClick={() => onImageClick && onImageClick(imageUrl)}
          />
          <button
            type="button"
            className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {image.name}
          </div>
        </div>
      );
      })}
    </div>
  );
}
