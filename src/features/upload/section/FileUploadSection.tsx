import React from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadSectionProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
}

export default function FileUploadSection({ selectedFile, onFileSelect }: FileUploadSectionProps) {
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false,
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '10px',
        padding: '30px',
        textAlign: 'center',
        backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
        cursor: 'pointer',
      }}
    >
      <input {...getInputProps()} />
      {selectedFile ? (
        <p>
          {selectedFile.name}（{(selectedFile.size / 1024 / 1024).toFixed(2)}MB）
        </p>
      ) : (
        <p>ここに動画ファイルをドロップ、またはクリックして選択</p>
      )}
    </div>
  );
}
