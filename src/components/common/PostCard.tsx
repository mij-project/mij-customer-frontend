import React from 'react';
import { Play, Clock, Eye, Heart, Bookmark, Crown, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LikeButton from '@/components/social/LikeButton';
import BookmarkButton from '@/components/social/BookmarkButton';

export interface PostCardProps {
  id: string;
  post_type: number;
  title: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  likes?: number;
  creator: {
    name: string;
    username: string;
    avatar?: string;
    verified: boolean;
  };
  rank?: number;
  showRank?: boolean;
  onClick?: (id: string) => void;
  onCreatorClick?: (username: string) => void;
}

export default function PostCard({
  id,
  post_type,
  title,
  thumbnail,
  duration = '00:00',
  views = 0,
  likes = 0,
  creator,
  rank,
  showRank = false,
  onClick,
  onCreatorClick
}: PostCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCreatorClick) {
      onCreatorClick(creator.username);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative" onClick={handleClick}>
        <img
          src={thumbnail || '/assets/no-image.svg'}
          alt={title}
          className="w-full aspect-square object-cover"
        />
        
        {/* Rank Badge */}
        {showRank && rank && (
          <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded flex items-center">
            {rank === 1 && <Crown className="h-3 w-3 mr-1" />}
            #{rank}
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
          {post_type === 1 && (
            <Clock className="h-3 w-3 mr-1" />
          )}
          {post_type === 2 && (
            <ImageIcon className="h-3 w-3 mr-1" />
          )}
          {duration}
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
          <Play className="h-12 w-12 text-white" />
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
          {title}
        </h3>
        
        {/* Creator Info */}
        <div className="flex items-center space-x-2 mb-2">
          <img
            src={creator.avatar || '/assets/no-image.svg'}
            alt={creator.name}
            className="w-6 h-6 rounded-full cursor-pointer"
            onClick={handleCreatorClick}
          />
          <span 
            className="text-xs text-gray-600 flex items-center cursor-pointer"
            onClick={handleCreatorClick}
          >
            {creator.name}
            {creator.verified && <span className="text-yellow-500 ml-1">★</span>}
          </span>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <LikeButton postId={id} initialCount={likes} />
            </span>
          </div>
          <BookmarkButton postId={id} className="h-6 px-2" />
        </div>
      </div>
    </div>
  );
}