import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PostGrid from './PostGrid';
import { PostCardProps } from './PostCard';

interface PostsSectionProps {
  title: string;
  posts: PostCardProps[];
  showMoreButton?: boolean;
  onMoreClick?: () => void;
  showRank?: boolean;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  onPostClick?: (id: string) => void;
  onCreatorClick?: (displayName: string) => void;
}

export default function PostsSection({
  title,
  posts,
  showMoreButton = true,
  onMoreClick,
  showRank = false,
  columns = 2,
  className = '',
  onPostClick,
  onCreatorClick,
}: PostsSectionProps) {
  return (
    <section className={`bg-white py-6 ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {showMoreButton && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary"
              onClick={onMoreClick}
            >
              もっと見る
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        <PostGrid
          posts={posts}
          showRank={showRank}
          columns={columns}
          onPostClick={onPostClick}
          onCreatorClick={onCreatorClick}
          className="gap-1 -mx-3 sm:-mx-5 lg:-mx-7"
        />
      </div>
    </section>
  );
}
