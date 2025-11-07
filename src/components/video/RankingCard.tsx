import React from 'react';
import { Clock, Eye, Heart, Bookmark, Star, Play, Crown } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  rank?: number;
  bookmarks?: number;
}

interface RankingCardProps {
  post: Post;
  className?: string;
}

export default function RankingCard({ post, className = '' }: RankingCardProps) {
  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500';
    if (rank === 2) return 'bg-gray-400';
    if (rank === 3) return 'bg-amber-600';
    return 'bg-primary';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}
    >
      <div className="relative">
        <img src={post.thumbnail} alt={post.title} className="w-full aspect-video object-cover" />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {post.duration}
        </div>
        {post.rank && (
          <div
            className={`absolute top-2 left-2 ${getRankBadgeColor(post.rank)} text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center`}
          >
            {post.rank}
          </div>
        )}
        <div className="absolute top-2 right-2">{post.rank && getRankIcon(post.rank)}</div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
          <Play className="h-12 w-12 text-white" />
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">{post.title}</h3>
        <div className="flex items-center space-x-2 mb-2">
          <img src={post.creator.avatar} alt={post.creator.name} className="w-6 h-6 rounded-full" />
          <span className="text-xs text-gray-600 flex items-center">
            {post.creator.name}
            {post.creator.verified && <Star className="h-3 w-3 text-yellow-500 ml-1" />}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {post.views.toLocaleString()}
            </span>
            <span className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {post.likes.toLocaleString()}
            </span>
            {post.bookmarks && (
              <span className="flex items-center">
                <Bookmark className="h-3 w-3 mr-1" />
                {post.bookmarks.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
