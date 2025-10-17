import React, { useState, useEffect } from 'react'; 
import BottomNavigation from '@/components/common/BottomNavigation';
import Header from '@/components/common/Header';
import { LoadingSpinner, ErrorMessage, PostsSection, PostCardProps } from '@/components/common';
import { useNavigate } from 'react-router-dom';

import CommonLayout from '@/components/layout/CommonLayout';

// セクションコンポーネントをインポート
import BannerCarouselSection from '@/features/top/section/BannerCarouselSection';
import PostLibraryNavigationSection from '@/features/top/section/PostLibraryNavigationSection';
import RecommendedGenresSection from '@/features/top/section/RecommendedGenresSection';
import CreatorsSection from '@/features/top/section/CreatorsSection';

// 型定義をインポート
import { BannerItem } from '@/features/top/types';
import { getTopPageData } from '@/api/endpoints/top';
import { TopPageData } from '@/api/types/type';

const bannerItems: BannerItem[] = [
  { id: '1', image: 'https://picsum.photos/800/200?random=31', title: 'Featured Content' },
  { id: '2', image: 'https://picsum.photos/800/200?random=32', title: 'New Releases' },
  { id: '3', image: 'https://picsum.photos/800/200?random=33', title: 'Popular Now' }
];

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
      } catch (err) {
        setError('トップページデータの取得に失敗しました');
        console.error('Top page data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPageData();
  }, []);

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
    <CommonLayout header={true}>
      
        {/* Header */}
        <Header />

        {/* Banner Carousel */}
        {/* <BannerCarouselSection bannerItems={bannerItems} /> */}

        {/* Post Library Navigation */}
        <PostLibraryNavigationSection />

        {/* Recommended Genres */}
        <RecommendedGenresSection categories={topPageData.categories} />

        {/* ランキング */}
        <PostsSection
          title="ランキング"
          posts={topPageData.ranking_posts}
          showRank={true}
          columns={2}
          onPostClick={handlePostClick}
          onCreatorClick={handleCreatorClick}
          onMoreClick={() => navigate('/ranking/posts')}
        />

        {/* トップユーザー */}
        <CreatorsSection 
          title="トップユーザー" 
          creators={topPageData.top_creators} 
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
          posts={topPageData.recent_posts}
          showRank={false}
          columns={2}
          onPostClick={handlePostClick}
          onCreatorClick={handleCreatorClick}
          showMoreButton={true}
          onMoreClick={() => navigate('/post/new-arrivals')}
        />

        {/* Fixed Bottom Navigation */}
        <BottomNavigation />
      
    </CommonLayout>
  );
}
