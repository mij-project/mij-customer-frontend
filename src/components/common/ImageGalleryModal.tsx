import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  getImageLabel?: (index: number) => string;
}

export default function ImageGalleryModal({
  isOpen,
  images,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
  getImageLabel,
}: ImageGalleryModalProps) {
  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* 画像種類ラベル */}
        {getImageLabel && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-bold z-10">
            {getImageLabel(currentIndex)}
          </div>
        )}

        {/* 前の画像ボタン */}
        {images.length > 1 && (
          <button
            onClick={onPrevious}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
        )}

        {/* 画像表示 */}
        {images[currentIndex] && (
          <img
            src={images[currentIndex]}
            alt={`画像 ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* 次の画像ボタン */}
        {images.length > 1 && (
          <button
            onClick={onNext}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronRight className="w-12 h-12" />
          </button>
        )}
      </div>
    </div>
  );
}
