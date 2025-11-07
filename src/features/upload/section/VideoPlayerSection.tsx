import React from 'react';
import { VideoPlayer } from '@/features/shareVideo/componets/videoPlayer';

interface VideoPlayerSectionProps {
  videoId: string;
  userId: string;
}

export default function VideoPlayerSection({ videoId, userId }: VideoPlayerSectionProps) {
  return (
    <div style={{ marginTop: 30 }}>
      <h4>アップロード完了動画:</h4>
      <VideoPlayer videoId={videoId} userId={userId} />
    </div>
  );
}
