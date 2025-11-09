import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccountHeader from '@/features/account/components/AccountHeader';
import PostFilterBar from '@/features/account/components/PostFilterBar';
import PostCard from '@/features/account/components/PostCard';
import EmptyState from '@/features/account/components/EmptyState';
import { getPlanPosts } from '@/api/endpoints/plans';

type FilterType = 'all' | 'image' | 'video';
type SortType = 'newest' | 'oldest' | 'popular';

interface PlanPost {
  id: string;
  thumbnailUrl: string | null;
  title: string;
  creatorAvatar: string | null;
  creatorName: string;
  creatorUsername: string;
  likesCount: number;
  commentsCount: number;
  duration?: string;
  isVideo: boolean;
  createdAt: string;
}

export default function PlanPostList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan_id');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [planPosts, setPlanPosts] = useState<PlanPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setError('プランIDが指定されていません');
      setLoading(false);
      return;
    }

    const fetchPlanPosts = async () => {
      try {
        const response = await getPlanPosts(planId);
        const formattedPosts = response.posts.map((item) => ({
          id: item.id,
          thumbnailUrl: item.thumbnail_url,
          title: item.title,
          creatorAvatar: item.creator_avatar,
          creatorName: item.creator_name,
          creatorUsername: item.creator_username,
          likesCount: item.likes_count,
          commentsCount: item.comments_count,
          duration: item.duration,
          isVideo: item.is_video,
          createdAt: item.created_at,
        }));
        setPlanPosts(formattedPosts);
      } catch (error) {
        console.error('プラン投稿一覧取得エラー:', error);
        setError('投稿の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanPosts();
  }, [planId]);

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/account/profile?username=${username}`);
  };

  // Filter posts based on active filter
  const filteredPosts = planPosts.filter((post) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'image') return !post.isVideo;
    if (activeFilter === 'video') return post.isVideo;
    return true;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'popular') {
      return b.likesCount - a.likesCount;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <AccountHeader title="プランの投稿" showBackButton />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <AccountHeader title="プランの投稿" showBackButton />
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
      <div className="min-h-screen bg-gray-50 pb-20">
        <AccountHeader title="プランの投稿" showBackButton />

        {/* Filter Bar */}
        <div className="fixed top-0 left-0 right-0 z-10 mt-16">
          <PostFilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showAllFilter={true}
          />
        </div>

        {/* Posts Grid */}
        <div className="p-4 pt-32">
          {sortedPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {sortedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  thumbnailUrl={post.thumbnailUrl || '/assets/no-image.svg'}
                  title={post.title}
                  creatorAvatar={post.creatorAvatar || '/assets/no-image.svg'}
                  creatorName={post.creatorName}
                  creatorUsername={post.creatorUsername}
                  likesCount={post.likesCount}
                  commentsCount={post.commentsCount}
                  duration={post.duration}
                  isVideo={post.isVideo}
                  onClick={handlePostClick}
                  onCreatorClick={handleCreatorClick}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="投稿がありません" />
          )}
        </div>
      </div>
    </div>
  );
}
