import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPostsByCategory } from '@/api/endpoints/post';
import SEOHead from '@/components/seo/SEOHead';

import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { PostCategory } from '@/features/category/types';
import PostsSection from '@/components/common/PostsSection';
import { PostCardProps } from '@/components/common/PostCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AuthDialog from '@/components/auth/AuthDialog';

export default function Category() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<PostCategory[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const navigate = useNavigate();

  const slug = searchParams.get('slug');
  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1);

  useEffect(() => {
    if (!slug) {
      navigate('/');
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getPostsByCategory(slug, page);
        setPosts(
          (response.posts || []).map((post) => ({
            ...post,
            views_count: post.views_count || 0,
          }))
        );
        setHasNext(!!response.has_next);
        setHasPrevious(!!response.has_previous);
        setCategoryName(response.category_name);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [slug, page, navigate]);

  const setPageInUrl = (nextPage: number) => {
    if (!slug) return;

    const params = new URLSearchParams(searchParams);
    params.set('slug', slug);
    params.set('page', String(Math.max(1, nextPage)));
    setSearchParams(params); // push history entry => Back/Forward sẽ quay về page cũ
    window.scrollTo({ top: 0, behavior: 'smooth' }); // tuỳ bạn, muốn giữ scroll thì bỏ dòng này
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  const convertToPosts = (posts: PostCategory[]): PostCardProps[] => {
    return posts.map((post) => ({
      id: post.id,
      post_type: post.post_type,
      title: post.description || '',
      thumbnail: post.thumbnail_url || 'https://picsum.photos/300/200?random=1',
      duration: post.duration || '00:00',
      views: post.views_count || 0,
      likes: post.likes_count || 0,
      creator: {
        name: post.creator_name,
        username: post.username,
        avatar: post.creator_avatar_url || 'https://picsum.photos/40/40?random=1',
        verified: false,
        official: post.official,
      },
      rank: undefined,
      is_time_sale: post.is_time_sale || false,
    }));
  };

  const displayCategoryName = categoryName || 'カテゴリー';

  return (
    <>
      <SEOHead
        title={`${displayCategoryName}のクリエイター一覧`}
        description={`${displayCategoryName}カテゴリのクリエイターコンテンツを探す。人気クリエイターの最新動画・画像を閲覧できます。`}
        canonical={`https://mijfans.jp/category?slug=${slug}`}
        keywords={`クリエイター, ${displayCategoryName}, ファンクラブ, サブスクリプション, コンテンツ`}
        type="website"
        noIndex={false}
        noFollow={false}
      />

      <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
        <div className="min-h-screen bg-white pb-20">
          <Header />
          <PostsSection
            title={displayCategoryName}
            showMoreButton={false}
            posts={convertToPosts(posts)}
            onCreatorClick={handleCreatorClick}
            showRank={false}
            columns={2}
            onPostClick={handlePostClick}
            onAuthRequired={() => setShowAuthDialog(true)}
          />

          {/* pagination section */}
          {/* pagination section*/}
          <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center space-x-2 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageInUrl(page - 1)}
              disabled={loading || !hasPrevious}
              aria-label="前のページ"
              className={!hasPrevious ? 'invisible' : ''}
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
              onClick={() => setPageInUrl(page + 1)}
              disabled={loading || !hasNext}
              aria-label="次のページ"
              className={!hasNext ? 'invisible' : ''}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
          <BottomNavigation />
        </div>
      </div>
    </>
  );
}
