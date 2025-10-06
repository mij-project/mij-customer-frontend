import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

interface PostCardProps {
  id: string;
  thumbnailUrl: string;
  title: string;
  creatorAvatar: string;
  creatorName: string;
  creatorUsername: string;
  likesCount: number;
  commentsCount: number;
  duration?: string; // 動画の場合の再生時間（例: "43:53"）
  isVideo?: boolean;
  onClick?: (postId: string) => void;
  onCreatorClick?: (username: string) => void;
}

export default function PostCard({
  id,
  thumbnailUrl,
  title,
  creatorAvatar,
  creatorName,
  creatorUsername,
  likesCount,
  commentsCount,
  duration,
  isVideo = false,
  onClick,
  onCreatorClick
}: PostCardProps) {
  return (
    <div className="bg-white cursor-pointer" onClick={() => onClick?.(id)}>
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={thumbnailUrl || '/src/assets/no-image.svg'}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Video Duration */}
        {isVideo && duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="py-3">
        {/* Title */}
        <p className="text-sm text-gray-900 line-clamp-2 mb-2">{title}</p>

        {/* Creator Info */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={creatorAvatar || '/src/assets/no-image.svg'}
            alt={creatorName}
            className="w-6 h-6 rounded-full object-cover cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onCreatorClick?.(creatorUsername);
            }}
          />
          <span className="text-xs text-gray-600">{creatorName}</span>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-pink-500">
            <Heart className="w-4 h-4 fill-pink-500" />
            <span className="text-xs font-medium">
              {likesCount >= 1000 ? `${(likesCount / 1000).toFixed(1)}K` : likesCount}
            </span>
          </div>
          <div className="flex items-center gap-1 text-pink-500">
            <MessageCircle className="w-4 h-4 fill-pink-500" />
            <span className="text-xs font-medium">
              {commentsCount >= 1000 ? `${(commentsCount / 1000).toFixed(1)}K` : commentsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
