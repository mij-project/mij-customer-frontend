import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountHeader from '@/features/account/component/AccountHeader';
import PostFilterBar from '@/features/account/component/PostFilterBar';
import PostCard from '@/features/account/component/PostCard';
import EmptyState from '@/features/account/component/EmptyState';
import { getBoughtPosts } from '@/api/endpoints/account';

type FilterType = 'all' | 'image' | 'video';
type SortType = 'newest' | 'oldest' | 'popular';

interface BoughtPost {
  id: string;
  thumbnailUrl: string;
  title: string;
  creatorAvatar: string;
  creatorName: string;
  creatorUsername: string;
  likesCount: number;
  commentsCount: number;
  duration?: string;
  isVideo: boolean;
  purchasedAt: string;
}

export default function AccountBoughtPost() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [boughtPosts, setBoughtPosts] = useState<BoughtPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoughtPosts = async () => {
      try {
        const response = await getBoughtPosts();
        const formattedPosts = response.bought_posts.map((item: any) => ({
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
          purchasedAt: item.created_at
        }));
        setBoughtPosts(formattedPosts);
      } catch (error) {
        console.error('購入済み取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoughtPosts();
  }, []);

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/creator/profile?username=${username}`);
  };

  // Filter posts based on active filter
  const filteredPosts = boughtPosts.filter(post => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'image') return !post.isVideo;
    if (activeFilter === 'video') return post.isVideo;
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <AccountHeader title="購入済みの投稿" showBackButton />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <AccountHeader title="購入済みの投稿" showBackButton />

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
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                thumbnailUrl={post.thumbnailUrl}
                title={post.title}
                creatorAvatar={post.creatorAvatar}
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
          <EmptyState message="購入済みの投稿がありません" />
        )}
      </div>
    </div>
  );
}
