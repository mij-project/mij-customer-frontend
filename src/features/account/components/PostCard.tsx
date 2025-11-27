import React from 'react';

interface PostCardProps {
  id: string;
  thumbnailUrl: string;
  title: string;
  description?: string;
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
  return (
    <div className="cursor-pointer" onClick={() => onClick?.(id)}>
      {/* Creator Info - 上部: アイコンとユーザー名を横並び */}
      <div className="flex items-center gap-1.5 mb-2">
        <img
          src={creatorAvatar || '/assets/no-image.svg'}
          alt={creatorName}
          className="w-5 h-5 rounded-full object-cover cursor-pointer flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onCreatorClick?.(creatorUsername);
          }}
        />
        <span className="text-xs text-gray-600 whitespace-nowrap truncate">{creatorName}</span>
      </div>

      {/* Title - 1行のみ、大きめのテキスト（ユーザー名の左端から開始） */}
      <p className="text-xs text-gray-900 mb-2 whitespace-nowrap truncate font-bold">{title}</p>

      {/* Thumbnail - 下部（タイトルと同じ左端から開始） */}
      <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={thumbnailUrl || '/assets/no-image.svg'}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Video Duration */}
        {isVideo && duration && (
          <div className="absolute bottom-2 right-2 bg-white text-gray-900 text-xs px-1.5 py-0.5 rounded whitespace-nowrap">
            {duration}
          </div>
        )}
      </div>
    </div>
  );
}
