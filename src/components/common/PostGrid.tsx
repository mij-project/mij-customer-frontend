import React from 'react';
import PostCard, { PostCardProps } from './PostCard';

interface PostGridProps {
  posts: PostCardProps[];
  showRank?: boolean;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  onPostClick?: (id: string) => void;
  onCreatorClick?: (displayName: string) => void;
  onAuthRequired?: () => void;
}

export default function PostGrid({
  posts,
  showRank = false,
  columns = 2,
  className = '',
  onPostClick,
  onCreatorClick,
  onAuthRequired,
}: PostGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-2 ${className}`}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          {...post}
          showRank={showRank}
          onClick={onPostClick}
          onCreatorClick={onCreatorClick}
          onAuthRequired={onAuthRequired}
        />
      ))}
    </div>
  );
}
