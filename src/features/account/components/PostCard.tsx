import React from 'react';

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
  duration,
  isVideo = false,
  onClick,
  onCreatorClick,
}: PostCardProps) {
  console.log(isVideo);
  return (
    <div className="bg-white cursor-pointer" onClick={() => onClick?.(id)}>
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2">
        <img
          src={thumbnailUrl || '/assets/no-image.svg'}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Video Duration */}
        {isVideo && duration && (
          <div className="absolute bottom-2 right-2 bg-white text-gray-900 text-xs px-1.5 py-0.5 rounded">
            {duration}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {/* Title - 1行のみ */}
        <p className="text-sm text-gray-900 line-clamp-1 mb-1.5">{title}</p>

        {/* Creator Info */}
        <div className="flex items-center gap-1.5">
          <img
            src={creatorAvatar || '/assets/no-image.svg'}
            alt={creatorName}
            className="w-5 h-5 rounded-full object-cover cursor-pointer flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onCreatorClick?.(creatorUsername);
            }}
          />
          <span className="text-xs text-gray-600 truncate">{creatorName}</span>
        </div>
      </div>
    </div>
  );
}
