import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<NewArrivalsPost[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // URLパラメータからページを取得（デフォルト: 1）
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

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
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

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
      is_time_sale: post.is_time_sale || false,
    }));
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ページネーションボタンを生成（最大5ページ分）
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPages = 5;

    // 現在のページを中心に5ページ分を計算
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = startPage + maxPages - 1;

    // has_nextがfalseの場合、それより先のページは表示しない
    if (!hasNext && currentPage > 0) {
      endPage = Math.min(endPage, currentPage);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <>
      <SEOHead
        title="シャッフル"
        description="mijfansのシャッフル。最新の投稿を閲覧できます。"
        canonical="https://mijfans.jp/post/new-arrivals"
        keywords="シャッフル,mijfans"
        type="website"
        noIndex={false}
        noFollow={false}
      />
      <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
        <div className="min-h-screen bg-white  pb-20">
          <Header />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <PostsSection
              title="シャッフル"
              posts={convertToPosts(posts)}
              showRank={false}
              columns={2}
              onPostClick={handlePostClick}
              onCreatorClick={handleCreatorClick}
              showMoreButton={false}
              showInfinityIcon={true}
            />
          )}

          {/* Pagination Section */}
          <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center space-x-2 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={loading || !hasPrevious}
              aria-label="前のページ"
              className={!hasPrevious ? "invisible" : ""}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              disabled={loading}
              className="min-w-[40px]"
            >
              {pageNum}
            </Button>
          ))} */}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={loading || !hasNext}
              aria-label="次のページ"
              className={!hasNext ? "invisible" : ""}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <BottomNavigation />
        </div>
      </div>
    </>
  );
}
