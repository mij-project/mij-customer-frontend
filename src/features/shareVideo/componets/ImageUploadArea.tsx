import React from 'react';
import { UploadCloud } from 'lucide-react';

interface ImageUploadAreaProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageUploadArea({ onFileChange }: ImageUploadAreaProps) {
  return (
    <>
      <label htmlFor="images-upload" className="cursor-pointer">
        <div className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-primary text-primary rounded-md hover:bg-primary/5 transition-colors">
          <UploadCloud className="w-8 h-8" />
          <span className="text-sm mt-2">画像を選択</span>
          <span className="text-xs text-gray-500 mt-1">複数選択可能</span>
        </div>
      </label>
      <input
        id="images-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileChange}
      />
    </>
  );
}
