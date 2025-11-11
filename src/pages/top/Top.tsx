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
import { getTopPageData } from '@/api/endpoints/top';
import { TopPageData } from '@/api/types/type';
import { getActiveBanners, Banner } from '@/api/endpoints/banners';
import { useAuth, User } from '@/providers/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import { toggleFollow } from '@/api/endpoints/social';
import ScrollToTop from '@/components/common/ScrollToTop';
import { Creator } from '@/features/top/types';

export default function Top() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [topPageData, setTopPageData] = useState<TopPageData | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDialog, setErrorDialog] = useState({
    show: false,
    message: '',
  });
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // トップページデータとバナーデータを並行取得
        const [topData, bannersData] = await Promise.all([getTopPageData(), getActiveBanners()]);
        setTopPageData(topData);
        setBanners(bannersData.banners);
      } catch (err) {
        setError('トップページデータの取得に失敗しました');
        console.error('Top page data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/account/profile?username=${username}`);
  };

  const handleCreatorFollowClick = async (isFollowing: boolean, creatorId: string) => {
    setIsFollowing(true);
    if (!user) {
      setShowAuthDialog(true);
      setIsFollowing(false);
      return;
    }
    try {
      const response = await toggleFollow(creatorId)
      if (response.status != 200) {
        throw new Error('フォローに失敗しました');
      }
      if(isFollowing) {
        setTopPageData(prev => ({
          ...prev,
          top_creators: prev?.top_creators.map(creator => creator.id === creatorId ? { ...creator, follower_ids: creator.follower_ids.filter(id => id !== user.id) } : creator)
        }));
      } else {
        setTopPageData(prev => ({
          ...prev,
          top_creators: prev?.top_creators.map(creator => creator.id === creatorId ? { ...creator, follower_ids: [...creator.follower_ids, user.id] } : creator)
        }));
      }
      return
    } catch (error) {
      console.error(error);
      setErrorDialog({ show: true, message: 'フォローに失敗しました' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    } finally {
      setIsFollowing(false);
    }
  };

  const convertCreators = (creators: Creator[]) => {
    return creators.map((creator) => {
      return {
        ...creator,
        is_following: creator.follower_ids.includes(user.id),
      };
    });
  }

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
      {errorDialog.show && <ErrorMessage message={errorDialog.message} variant="error" onClose={() => setErrorDialog({ show: false, message: '' })} />}
      {/* Header */}
      <Header />

      {/* Banner Carousel */}
      <BannerCarouselSection banners={banners} />

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
      {user ? (
        <CreatorsSection
          title="トップユーザー"
          creators={convertCreators(topPageData.top_creators)}
          showRank={true}
          showMoreButton={true}
          onCreatorClick={handleCreatorClick}
          onFollowClick={handleCreatorFollowClick}
          isShowFollowButton={isFollowing}
          onShowMoreClick={() => navigate('/ranking/creators')}
        />
      ) : (
        <CreatorsSection
          title="トップユーザー"
          creators={topPageData.top_creators}
          showRank={true}
          showMoreButton={true}
          onCreatorClick={handleCreatorClick}
          onFollowClick={handleCreatorFollowClick}
          isShowFollowButton={isFollowing}
        />
      )}

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
      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
      {/* Fixed Bottom Navigation */}
      <BottomNavigation />
    </CommonLayout>
  );
}
