import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FilterSection from '@/features/ranking/section/FilterSection';
import PostsSection from '@/components/common/PostsSection';
import {
  RankingCategoriesResponse,
  RankingOverallResponse,
  TabItem,
} from '@/features/ranking/types';
import { getPostsRankingOverall, getPostsRankingCategories } from '@/api/endpoints/ranking';
import { getLikesStatusBulk, getBookmarksStatusBulk } from '@/api/endpoints/social';
import { useAuth } from '@/providers/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import SEOHead from '@/components/seo/SEOHead';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'all';

function pickOverallPosts(period: TimePeriod, overall: RankingOverallResponse | null): any[] {
  if (!overall) return [];
  switch (period) {
    case 'daily':
      return overall.daily || [];
    case 'weekly':
      return overall.weekly || [];
    case 'monthly':
      return overall.monthly || [];
    case 'all':
    default:
      return overall.all_time || [];
  }
}

function pickCategoryBlocks(
  period: TimePeriod,
  categories: RankingCategoriesResponse | null
): any[] {
  if (!categories) return [];
  switch (period) {
    case 'daily':
      return categories.daily || [];
    case 'weekly':
      return categories.weekly || [];
    case 'monthly':
      return categories.monthly || [];
    case 'all':
    default:
      return categories.all_time || [];
  }
}

export default function PostRanking() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTimePeriod, setActiveTimePeriod] = useState<TimePeriod>('all');

  const [rankingOverallData, setRankingOverallData] = useState<RankingOverallResponse | null>(null);
  const [rankingCategoriesData, setRankingCategoriesData] =
    useState<RankingCategoriesResponse | null>(null);

  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [socialStatuses, setSocialStatuses] = useState<{
    likes: Record<string, { liked: boolean; likes_count: number }>;
    bookmarks: Record<string, { bookmarked: boolean }>;
  }>({ likes: {}, bookmarks: {} });

  // 1) Fetch ranking (cancel when unmount)
  useEffect(() => {
    const ac = new AbortController();

    const fetchRanking = async () => {
      try {
        const [overallResponse, categoriesResponse] = await Promise.all([
          getPostsRankingOverall(ac.signal),
          getPostsRankingCategories(ac.signal),
        ]);

        setRankingOverallData(overallResponse);
        setRankingCategoriesData(categoriesResponse);
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        console.error('Error fetching ranking:', err);
      }
    };

    fetchRanking();
    return () => ac.abort();
  }, []);

  // 2) Derived data: current posts by period
  const currentOverallPosts = useMemo(
    () => pickOverallPosts(activeTimePeriod, rankingOverallData),
    [activeTimePeriod, rankingOverallData]
  );

  const currentCategoriesData = useMemo(
    () => pickCategoryBlocks(activeTimePeriod, rankingCategoriesData),
    [activeTimePeriod, rankingCategoriesData]
  );

  // 3) Build postId list (dedupe + stable order)
  const allPostIds = useMemo(() => {
    const ids = new Set<string>();

    for (const p of currentOverallPosts || []) {
      if (p?.id) ids.add(p.id);
    }

    for (const cat of currentCategoriesData || []) {
      for (const p of cat?.posts || []) {
        if (p?.id) ids.add(p.id);
      }
    }

    return Array.from(ids);
  }, [currentOverallPosts, currentCategoriesData]);

  // 4) Fetch social statuses (cancel + avoid refetch when same ids)
  const lastIdsKeyRef = useRef<string>('');
  useEffect(() => {
    if (!user) {
      setSocialStatuses({ likes: {}, bookmarks: {} });
      return;
    }
    if (allPostIds.length === 0) return;

    const idsKey = allPostIds.join(',');
    if (idsKey === lastIdsKeyRef.current) return;
    lastIdsKeyRef.current = idsKey;

    const ac = new AbortController();

    const fetchSocialStatuses = async () => {
      try {
        const [likesResponse, bookmarksResponse] = await Promise.all([
          getLikesStatusBulk(allPostIds, ac.signal as any),
          getBookmarksStatusBulk(allPostIds, ac.signal as any),
        ]);

        setSocialStatuses({
          likes: likesResponse.data,
          bookmarks: bookmarksResponse.data,
        });
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        console.error('Failed to fetch social statuses:', err);
      }
    };

    fetchSocialStatuses();
    return () => ac.abort();
  }, [allPostIds, user?.id]);

  const tabItems: TabItem[] = useMemo(
    () => [
      { id: 'posts', label: '投稿', isActive: true, linkTo: '/ranking/posts' },
      { id: 'creators', label: 'クリエイター', isActive: false, linkTo: '/ranking/creators' },
    ],
    []
  );

  const timePeriodTabs: TabItem[] = useMemo(
    () => [
      { id: 'daily', label: '日間', isActive: activeTimePeriod === 'daily' },
      { id: 'weekly', label: '週間', isActive: activeTimePeriod === 'weekly' },
      { id: 'monthly', label: '月間', isActive: activeTimePeriod === 'monthly' },
      { id: 'all', label: '全期間', isActive: activeTimePeriod === 'all' },
    ],
    [activeTimePeriod]
  );

  const handleTabClick = (tabId: string) => {
    const tabLink = tabItems.find((tab) => tab.id === tabId)?.linkTo;
    if (tabLink) navigate(tabLink);
  };

  const handleTimePeriodClick = (periodId: string) => {
    setActiveTimePeriod(periodId as TimePeriod);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  // 5) convert posts -> cards (memoized)
  const overallCards = useMemo(() => {
    return (currentOverallPosts || []).map((post) => {
      const postId = post.id;
      const likeStatus = socialStatuses.likes[postId];
      const bookmarkStatus = socialStatuses.bookmarks[postId];

      return {
        id: postId,
        post_type: post.post_type || 1,
        title: post.description || '',
        thumbnail: post.thumbnail_url || '',
        duration: post.duration || '00:00',
        views: post.views_count || 0,
        likes: likeStatus?.likes_count ?? post.likes_count ?? 0,
        creator: {
          name: post.creator_name || '',
          username: post.username || '',
          avatar: post.creator_avatar_url || '',
          verified: false,
          official: post.official || false,
        },
        rank: post.rank,
        initialLiked: likeStatus?.liked,
        initialBookmarked: bookmarkStatus?.bookmarked,
      };
    });
  }, [currentOverallPosts, socialStatuses]);

  const categoryCards = useMemo(() => {
    return (currentCategoriesData || []).map((category) => {
      const posts = (category.posts || []).map((post: any) => {
        const postId = post.id;
        const likeStatus = socialStatuses.likes[postId];
        const bookmarkStatus = socialStatuses.bookmarks[postId];

        return {
          id: postId,
          post_type: post.post_type || 1,
          title: post.description || '',
          thumbnail: post.thumbnail_url || '',
          duration: post.duration || '00:00',
          views: post.views_count || 0,
          likes: likeStatus?.likes_count ?? post.likes_count ?? 0,
          creator: {
            name: post.creator_name || '',
            username: post.username || '',
            avatar: post.creator_avatar_url || '',
            verified: false,
            official: post.official || false,
          },
          rank: post.rank,
          initialLiked: likeStatus?.liked,
          initialBookmarked: bookmarkStatus?.bookmarked,
        };
      });

      return { ...category, _cards: posts };
    });
  }, [currentCategoriesData, socialStatuses]);

  return (
    <>
      <SEOHead
        title="投稿ランキング"
        description="mijfansのランキング。投稿、クリエイターのランキングを閲覧できます。"
        canonical="https://mijfans.jp/ranking/posts"
        keywords="投稿ランキング,クリエイターランキング,mijfans"
        type="website"
        noIndex={false}
        noFollow={false}
      />

      <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header />

          <FilterSection
            tabItems={tabItems}
            timePeriodTabs={timePeriodTabs}
            onTabClick={handleTabClick}
            onTimePeriodClick={handleTimePeriodClick}
          />

          <PostsSection
            title={'総合ランキング'}
            showMoreButton={true}
            onMoreClick={() => {
              navigate('/ranking/posts/overall?category=総合ランキング&category_id=');
            }}
            posts={overallCards}
            showRank={true}
            columns={2}
            onPostClick={handlePostClick}
            onCreatorClick={handleCreatorClick}
            onAuthRequired={() => setShowAuthDialog(true)}
          />

          {categoryCards.map((category) => (
            <PostsSection
              key={category.category_id}
              title={category.category_name}
              showMoreButton={true}
              onMoreClick={() => {
                navigate(
                  `/ranking/posts/detail?category=${encodeURIComponent(
                    category.category_name
                  )}&category_id=${category.category_id}`
                );
              }}
              posts={category._cards}
              showRank={true}
              columns={2}
              onPostClick={handlePostClick}
              onCreatorClick={handleCreatorClick}
              onAuthRequired={() => setShowAuthDialog(true)}
            />
          ))}

          <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
          <BottomNavigation />
        </div>
      </div>
    </>
  );
}
