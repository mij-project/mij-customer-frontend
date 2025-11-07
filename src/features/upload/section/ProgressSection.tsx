import React from 'react';

interface ProgressSectionProps {
  uploading: boolean;
  progress: number;
}

export default function ProgressSection({ uploading, progress }: ProgressSectionProps) {
  if (!uploading) return null;

  return (
    <div style={{ width: '100%', backgroundColor: '#eee', marginTop: '10px' }}>
      <div
        style={{
          width: `${progress}%`,
          backgroundColor: '#4caf50',
          height: '10px',
          transition: 'width 0.3s',
        }}
      />
    </div>
  );
}
