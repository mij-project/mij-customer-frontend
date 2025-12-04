import React, { useState, useEffect } from 'react';
import BottomNavigation from '@/components/common/BottomNavigation';
import Header from '@/components/common/Header';
import { LoadingSpinner, ErrorMessage, PostsSection, PostCardProps } from '@/components/common';
import { useNavigate, useLocation } from 'react-router-dom';

import CommonLayout from '@/components/layout/CommonLayout';

// セクションコンポーネントをインポート
import BannerCarouselSection from '@/features/top/section/BannerCarouselSection';
import PostLibraryNavigationSection from '@/features/top/section/PostLibraryNavigationSection';
import RecommendedGenresSection from '@/features/top/section/RecommendedGenresSection';
import CreatorsSection from '@/features/top/section/CreatorsSection';

// コンポーネントをインポート
import WelcomeModal from '@/components/top/WelcomeModal';

// 型定義をインポート
import { getTopPageData } from '@/api/endpoints/top';
import { TopPageData } from '@/api/types/type';
import { getActiveBanners, Banner, PreRegisterUser } from '@/api/endpoints/banners';
import { useAuth, User } from '@/providers/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import { toggleFollow, getLikesStatusBulk, getBookmarksStatusBulk } from '@/api/endpoints/social';
import { Creator } from '@/features/top/types';

export default function Top() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [topPageData, setTopPageData] = useState<TopPageData | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [preRegisterUsers, setPreRegisterUsers] = useState<PreRegisterUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDialog, setErrorDialog] = useState({
    show: false,
    message: '',
  });
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [authType, setAuthType] = useState<'email' | 'x'>('email');
  const [isFollowing, setIsFollowing] = useState(false);
  const [socialStatuses, setSocialStatuses] = useState<{
    likes: Record<string, { liked: boolean; likes_count: number }>;
    bookmarks: Record<string, { bookmarked: boolean }>;
  }>({ likes: {}, bookmarks: {} });

  // 認証完了チェック（メール認証 or X認証）
  useEffect(() => {
    const state = location.state as {
      emailVerified?: boolean;
      isNewUser?: boolean;
      authType?: 'email' | 'x';
    } | null;

    if (state?.emailVerified) {
      // メール認証完了
      setAuthType('email');
      setShowWelcomeModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (state?.isNewUser) {
      // X認証での新規登録
      setAuthType(state.authType || 'x');
      setShowWelcomeModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // トップページデータとバナーデータを並行取得
        const [topData, bannersData] = await Promise.all([getTopPageData(), getActiveBanners()]);
        setTopPageData(topData);
        setBanners(bannersData.banners);
        setPreRegisterUsers(bannersData.pre_register_users || []);
      } catch (err) {
        setError('トップページデータの取得に失敗しました');
        console.error('Top page data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch social statuses when topPageData changes
  useEffect(() => {
    const fetchSocialStatuses = async () => {
      if (!user || !topPageData) return;

      // Collect all post IDs from recent_posts and ranking_posts
      const allPostIds: string[] = [];
      topPageData.recent_posts.forEach((post) => allPostIds.push(post.id));
      topPageData.ranking_posts.forEach((post) => allPostIds.push(post.id));

      if (allPostIds.length === 0) return;

      try {
        const [likesResponse, bookmarksResponse] = await Promise.all([
          getLikesStatusBulk(allPostIds),
          getBookmarksStatusBulk(allPostIds),
        ]);

        setSocialStatuses({
          likes: likesResponse.data,
          bookmarks: bookmarksResponse.data,
        });
      } catch (error) {
        console.error('Failed to fetch social statuses:', error);
      }
    };

    fetchSocialStatuses();
  }, [topPageData, user]);

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  const handleCreatorFollowClick = async (isFollowing: boolean, creatorId: string) => {

    if (!user) {
      setShowAuthDialog(true);
      setIsFollowing(false);
      return;
    }

    setIsFollowing(true);
    try {
      const response = await toggleFollow(creatorId);
      if (response.status != 200) {
        throw new Error('フォローに失敗しました');
      }
      if (isFollowing) {
        setTopPageData((prev) => ({
          ...prev,
          top_creators: prev?.top_creators.map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: creator.follower_ids.filter((id) => id !== user.id) }
              : creator
          ),
        }));
      } else {
        setTopPageData((prev) => ({
          ...prev,
          top_creators: prev?.top_creators.map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: [...creator.follower_ids, user.id] }
              : creator
          ),
        }));
      }
      return;
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
  };

  const convertPostsWithSocialStatus = (posts: any[]): PostCardProps[] => {
    return posts.map((post) => {
      const postId = post.id;
      const likeStatus = socialStatuses.likes[postId];
      const bookmarkStatus = socialStatuses.bookmarks[postId];

      return {
        id: postId,
        post_type: post.post_type || 1,
        title: post.title || '',
        thumbnail: post.thumbnail || '',
        duration: post.duration || '00:00',
        views: post.views || 0,
        likes: likeStatus?.likes_count ?? post.likes ?? 0,
        creator: {
          name: post.creator.name || '',
          username: post.creator.username || '',
          avatar: post.creator.avatar_url || '',
          verified: post.creator.verified || false,
          official: post.creator.official || false,
        },
        rank: post.rank,
        initialLiked: likeStatus?.liked,
        initialBookmarked: bookmarkStatus?.bookmarked,
      };
    });
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
      {/* ウェルカムモーダル */}
      {showWelcomeModal && (
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          handleMoveToCreatorRequest={() => navigate('/creator/request')}
          authType={authType}
        />
      )}

      {errorDialog.show && (
        <ErrorMessage
          message={errorDialog.message}
          variant="error"
          onClose={() => setErrorDialog({ show: false, message: '' })}
        />
      )}
      {/* Header */}
      <Header />

      {/* Banner Carousel */}
      <BannerCarouselSection banners={banners} preRegisterUsers={preRegisterUsers} />

      {/* Post Library Navigation */}
      <PostLibraryNavigationSection />

       {/* 新着投稿 */}
       <PostsSection
        title="新着投稿"
        posts={convertPostsWithSocialStatus(topPageData.recent_posts)}
        showRank={false}
        columns={2}
        onPostClick={handlePostClick}
        onCreatorClick={handleCreatorClick}
        showMoreButton={true}
        onMoreClick={() => navigate('/post/new-arrivals')}
        onAuthRequired={() => setShowAuthDialog(true)}
      />

      {/* Recommended Genres */}
      <RecommendedGenresSection categories={topPageData.categories} />

      {/* ランキング */}
      <PostsSection
        title="ランキング"
        posts={convertPostsWithSocialStatus(topPageData.ranking_posts)}
        showRank={true}
        columns={2}
        onPostClick={handlePostClick}
        onCreatorClick={handleCreatorClick}
        onMoreClick={() => navigate('/ranking/posts')}
        onAuthRequired={() => setShowAuthDialog(true)}
      />

      {/* トップユーザー */}
      {user ? (
        <CreatorsSection
          title="トップクリエイター"
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
          title="トップクリエイター"
          creators={topPageData.top_creators}
          showRank={true}
          showMoreButton={true}
          onCreatorClick={handleCreatorClick}
          onFollowClick={handleCreatorFollowClick}
          isShowFollowButton={isFollowing}
          onShowMoreClick={() => navigate('/ranking/creators')}
        />
      )}

      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
      {/* Fixed Bottom Navigation */}
      <BottomNavigation />
    </CommonLayout>
  );
}
