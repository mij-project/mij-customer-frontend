import React, { useState, useEffect, useMemo, useRef } from 'react';
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

export default function Category() {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<PostCategory[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const slug = searchParams.get('slug');
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) {
      navigate('/');
    }
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getPostsByCategory(slug, page);
        setPosts(response.posts || []);
        setHasNext(response.has_next);
        setHasPrevious(response.has_previous);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [slug, page]);

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
      },
      rank: undefined,
    }));
  };

  // カテゴリ名を取得（slugから生成）
  const categoryName = slug
    ? slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'カテゴリー';

  return (
    <>
      <SEOHead
        title={`${categoryName}のクリエイター一覧`}
        description={`${categoryName}カテゴリのクリエイターコンテンツを探す。人気クリエイターの最新動画・画像を閲覧できます。`}
        canonical={`https://mijfans.jp/category?slug=${slug}`}
        keywords={`クリエイター, ${categoryName}, ファンクラブ, サブスクリプション, コンテンツ`}
        type="website"
        noIndex={false}
        noFollow={false}
      />

      <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />
          <PostsSection
            title="カテゴリー別ランキング"
            showMoreButton={false}
            posts={convertToPosts(posts)}
            onCreatorClick={handleCreatorClick}
            showRank={false}
            columns={2}
            onPostClick={handlePostClick}
          />
          {/* pagination section*/}
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
