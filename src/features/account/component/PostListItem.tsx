import React from 'react';

interface PostListItemProps {
  id: string;
  creatorAvatar: string;
  creatorName: string;
  creatorUsername: string;
  postTitle: string;
  postPrice?: number;
  postDate?: string;
  thumbnailUrl: string;
  onUserClick?: (username: string) => void;
  onPostClick?: (postId: string) => void;
}

export default function PostListItem({
  id,
  creatorAvatar,
  creatorName,
  creatorUsername,
  postTitle,
  postPrice,
  postDate,
  thumbnailUrl,
  onUserClick,
  onPostClick,
}: PostListItemProps) {
  return (
    <div className="border border-gray-100 rounded p-3">
      <div className="flex items-start space-x-3" onClick={() => onPostClick?.(id)}>
        <img
          src={creatorAvatar || '/assets/no-image.svg'}
          alt={creatorName}
          className="w-10 h-10 rounded-full object-cover cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onUserClick?.(creatorUsername);
          }}
        />
        <div className="flex-1">
          <div className="font-medium text-sm">{creatorName}</div>
          <div className="text-xs text-gray-500">@{creatorUsername}</div>
          <div className="text-sm mt-1">{postTitle}</div>
          {postPrice !== undefined && (
            <div className="text-sm text-gray-600 mt-1">{postPrice}円</div>
          )}
          {postDate && (
            <div className="text-xs text-gray-500 mt-1">
              {new Date(postDate).toLocaleDateString('ja-JP')}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <img
            src={thumbnailUrl || '/assets/no-image.svg'}
            alt="投稿のサムネイル"
            className="w-16 h-16 rounded object-cover"
          />
        </div>
      </div>
    </div>
  );
}
