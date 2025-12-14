import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import PostsSection from '@/components/common/PostsSection';
import { getNewArrivals } from '@/api/endpoints/post';
import { PostCardProps } from '@/components/common/PostCard';
import SEOHead from '@/components/seo/SEOHead';
import { LoadingSpinner } from '@/components/common';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewArrivalsPost } from '@/api/types/post';

export default function PostNewArrivals() {
  const [posts, setPosts] = useState<NewArrivalsPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await getNewArrivals(pageNum, 20);
      setPosts(data.posts);
      setHasNext(data.has_next);
      setHasPrevious(data.has_previous);
    } catch (err) {
      console.error('New arrivals fetch error:', err);
      setPosts([]);
      setHasNext(false);
      setHasPrevious(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  const convertToPosts = (posts: NewArrivalsPost[]): PostCardProps[] => {
    return posts.map((post) => ({
      id: post.id,
      post_type: 1,
      title: post.description || '',
      thumbnail: post.thumbnail_url || 'https://picsum.photos/300/200?random=1',
      duration: post.duration || '0:00',
      views: 0,
      likes: post.likes_count || 0,
      creator: {
        name: post.creator_name,
        username: post.username,
        avatar: post.creator_avatar_url || 'https://picsum.photos/40/40?random=1',
        verified: false,
        official: false,
      },
    }));
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  return (
    <>
      <SEOHead
        title="新着投稿"
        description="mijfansの新着投稿。最新の投稿を閲覧できます。"
        canonical="https://mijfans.jp/post/new-arrivals"
        keywords="新着投稿,mijfans"
        type="website"
        noIndex={false}
        noFollow={false}
      />
      <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <PostsSection
              title="新着投稿"
              posts={convertToPosts(posts)}
              showRank={false}
              columns={2}
              onPostClick={handlePostClick}
              onCreatorClick={handleCreatorClick}
              showMoreButton={false}
            />
          )}

          {/* Pagination Section */}
          <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center gap-2">
            {hasPrevious && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev - 1)}
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {hasNext && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <BottomNavigation />
        </div>
      </div>
    </>
  );
}
