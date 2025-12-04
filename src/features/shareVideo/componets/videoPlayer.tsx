import React, { useEffect, useState } from 'react';
import { fetchVideoPlayUrl } from '@/api/endpoints/video';

export const VideoPlayer = ({ videoId, userId }: { videoId: string; userId: string }) => {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    const loadVideo = async () => {
      const request = {
        video_id: videoId,
        user_id: userId,
      };
      const response = await fetchVideoPlayUrl(request);

      const url = response.play_url;
      setVideoUrl(url);
    };
    loadVideo();
  }, [videoId, userId]);

  if (!videoUrl) return <p>Loading...</p>;

  return <video src={videoUrl} controls width="100%" />;
};
