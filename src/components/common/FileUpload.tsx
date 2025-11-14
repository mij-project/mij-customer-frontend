import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Camera, CheckCircle, X } from 'lucide-react';

export interface FileUploadProps {
  id: string;
  name: string;
  type: string;
  uploaded: boolean;
  file?: File | null;
  progress?: number;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  icon?: 'file' | 'camera' | 'image';
  showProgress?: boolean;
  showFileInfo?: boolean;
  showPreview?: boolean;
  compact?: boolean;
  onFileSelect: (file: File | null) => void;
  onRemove?: () => void;
}

export default function FileUpload({
  id,
  name,
  type,
  uploaded,
  file,
  progress = 0,
  disabled = false,
  accept = 'image/jpeg,image/png,application/pdf',
  maxSize = 10 * 1024 * 1024, // 10MB default
  icon = 'file',
  showProgress = true,
  showFileInfo = true,
  showPreview = false,
  compact = false,
  onFileSelect,
  onRemove,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && showPreview) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [file, showPreview]);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      // Validate file type
      const allowedTypes = accept.split(',').map((type) => type.trim());
      if (!allowedTypes.includes(selectedFile.type)) {
        alert(`ファイル形式は ${allowedTypes.join(', ')} のみです`);
        return;
      }

      // Validate file size
      if (selectedFile.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        alert(`ファイルサイズは ${maxSizeMB}MB 以下にしてください`);
        return;
      }
    }
    onFileSelect(selectedFile);
  };

  const getIcon = () => {
    if (uploaded) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    }

    switch (icon) {
      case 'camera':
        return <Camera className="h-8 w-8 text-gray-400" />;
      case 'image':
        return <Upload className="h-8 w-8 text-gray-400" />;
      default:
        return <FileText className="h-8 w-8 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg text-center transition-colors ${
        uploaded ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
      } ${compact ? 'p-4' : 'p-6'}`}
    >
      <div className="flex flex-col items-center space-y-2">
        {/* Image Preview */}
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={name}
              className={`rounded-lg object-cover ${compact ? 'w-20 h-20' : 'w-32 h-32'}`}
            />
            {onRemove && !uploaded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          getIcon()
        )}

        <h3 className={`font-medium text-gray-900 ${compact ? 'text-xs' : 'text-sm'}`}>{name}</h3>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />

        {!uploaded && !previewUrl && (
          <Button
            onClick={handleClick}
            variant="outline"
            className="mt-2"
            disabled={disabled}
            size={compact ? 'sm' : 'default'}
          >
            <Upload className="h-4 w-4 mr-2" />
            ファイルを選択
          </Button>
        )}

        {!uploaded && previewUrl && (
          <Button onClick={handleClick} variant="outline" size="sm" className="mt-1">
            変更
          </Button>
        )}

        {file && onRemove && !uploaded && !previewUrl && (
          <Button onClick={onRemove} variant="outline" size="sm" className="mt-1">
            <X className="h-4 w-4 mr-1" />
            削除
          </Button>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full h-2 bg-gray-200 rounded mt-2 overflow-hidden">
            <div className="h-2 bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* File Info */}
        {showFileInfo && file && !uploaded && (
          <p className={`text-gray-500 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {file.name} ({formatFileSize(file.size)})
          </p>
        )}

        {uploaded && (
          <p className={`text-green-600 ${compact ? 'text-xs' : 'text-sm'}`}>アップロード完了</p>
        )}
      </div>
    </div>
  );
}
