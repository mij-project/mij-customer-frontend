import React from 'react';
import FileUpload, { FileUploadProps } from './FileUpload';

interface FileUploadGridProps {
  uploads: (Omit<FileUploadProps, 'onFileSelect' | 'onRemove'> & {
    onFileSelect: (type: string, file: File | null) => void;
    onRemove?: (type: string) => void;
  })[];
  className?: string;
  columns?: 1 | 2 | 3;
}

export default function FileUploadGrid({
  uploads,
  className = '',
  columns = 1,
}: FileUploadGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {uploads.map((upload) => (
        <FileUpload
          key={upload.id}
          {...upload}
          onFileSelect={(file) => upload.onFileSelect(upload.type, file)}
          onRemove={upload.onRemove ? () => upload.onRemove!(upload.type) : undefined}
        />
      ))}
    </div>
  );
}
