import React, { useState, useEffect } from 'react';
import BottomNavigation from '@/components/common/BottomNavigation';
import Header from '@/components/common/Header';
import { LoadingSpinner, ErrorMessage, PostsSection, PostCardProps } from '@/components/common';
import { useNavigate } from 'react-router-dom';

// セクションコンポーネントをインポート
import BannerCarouselSection from '@/features/top/section/BannerCarouselSection';
import PostLibraryNavigationSection from '@/features/top/section/PostLibraryNavigationSection';
import RecommendedGenresSection from '@/features/top/section/RecommendedGenresSection';
import CreatorsSection from '@/features/top/section/CreatorsSection';

// 型定義をインポート
import { Post, Creator, Genre, BannerItem } from '@/features/top/types';
import { getTopPageData } from '@/api/endpoints/top';
import { TopPageData } from '@/api/types/type';
import PostGrid from '@/components/common/PostGrid';

import { debugCookies } from '@/api/endpoints/debug_cookies';

// const bannerItems: BannerItem[] = [
//   { id: '1', image: 'https://picsum.photos/800/200?random=31', title: 'Featured Content' },
//   { id: '2', image: 'https://picsum.photos/800/200?random=32', title: 'New Releases' },
//   { id: '3', image: 'https://picsum.photos/800/200?random=33', title: 'Popular Now' }
// ];

export default function Top() {
  const navigate = useNavigate();
  const [topPageData, setTopPageData] = useState<TopPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopPageData = async () => {
      try {
        setLoading(true);
        const data = await getTopPageData();
        setTopPageData(data);
        const cookies = await debugCookies();
        console.log('cookies', cookies);
      } catch (err) {
        setError('トップページデータの取得に失敗しました');
        console.error('Top page data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPageData();
  }, []);

  const convertToGenres = (genres: TopPageData['genres']): Genre[] => {
    return genres.map(genre => ({
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
      postCount: genre.post_count
    }));
  };

  const convertToPosts = (posts: TopPageData['ranking_posts'] | TopPageData['recent_posts']): PostCardProps[] => {
    return posts.map(post => ({
      id: post.id,
      title: post.description || '',
      thumbnail: post.thumbnail_url || 'https://picsum.photos/300/200?random=1',
      duration: post.duration || 0,
      views: 0,
      likes: post.likes_count || 0,
      creator: {
        name: post.creator_name,
        username: post.username,
        avatar: post.creator_avatar_url || 'https://picsum.photos/40/40?random=1',
        verified: false
      },
      rank: 'rank' in post ? post.rank : undefined,
    }));
  };

  const convertToCreators = (creators: TopPageData['top_creators'] | TopPageData['new_creators']): Creator[] => {
    return creators.map(creator => ({
      id: creator.id,
      name: creator.name,
      username: creator.username,
      avatar: creator.avatar_url || 'https://picsum.photos/60/60?random=1',
      followers: creator.followers_count,
      verified: false,
      rank: creator.rank
    }));
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/account/profile?username=${username}`);
  };
  

  if (loading) {
    return (
      <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
        <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
        <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center p-6">
          <ErrorMessage message={error} variant="error" />
        </div>
      </div>
    );
  }

  if (!topPageData) {
    return (
      <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
        <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
          <ErrorMessage message="データが見つかりません" variant="warning" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <Header />

        {/* Banner Carousel */}
        {/* <BannerCarouselSection bannerItems={bannerItems} /> */}

        {/* Post Library Navigation */}
        <PostLibraryNavigationSection />

        {/* Recommended Genres */}
        <RecommendedGenresSection genres={convertToGenres(topPageData.genres)} />

        {/* ランキング */}
        <PostsSection
          title="ランキング"
          posts={convertToPosts(topPageData.ranking_posts)}
          showRank={true}
          columns={2}
          onPostClick={handlePostClick}
          onCreatorClick={handleCreatorClick}
          onMoreClick={() => navigate('/ranking/posts')}
        />

        {/* トップユーザー */}
        <CreatorsSection 
          title="トップユーザー" 
          creators={convertToCreators(topPageData.top_creators)} 
          showRank={true}
          showMoreButton={true}
        />

        {/* 新人ユーザー */}
        {/* <CreatorsSection 
          title="新人ユーザー" 
          creators={convertToCreators(topPageData.new_creators)} 
        /> */}

        {/* 注目ユーザー */}
        {/* <CreatorsSection 
          title="注目ユーザー" 
          creators={convertToCreators(topPageData.new_creators)} 
        /> */}

        {/* 新着投稿 */}
        <PostsSection
          title="新着投稿"
          posts={convertToPosts(topPageData.recent_posts)}
          showRank={false}
          columns={2}
          onPostClick={handlePostClick}
          onCreatorClick={handleCreatorClick}
          showMoreButton={true}
          onMoreClick={() => navigate('/post/new-arrivals')}
        />

        {/* Fixed Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
}
