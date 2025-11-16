import React from 'react';
import { CircularProgress } from '@/components/ui/circular-progress';

interface UploadProgressModalProps {
  isOpen: boolean;
  progress: number;
  title?: string;
  message?: string;
}

export const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  isOpen,
  progress,
  title = '投稿中',
  message = 'しばらくお待ちください...',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

          {/* Circular Progress Bar */}
          <CircularProgress progress={progress} size={150} strokeWidth={10} />

          {/* Message */}
          <p className="text-gray-600 text-center">{message}</p>

          {/* Status indicator */}
          {progress < 100 && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">アップロード中...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
