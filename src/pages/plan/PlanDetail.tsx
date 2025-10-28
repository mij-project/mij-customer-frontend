import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlanDetail, getPlanPostsPaginated } from '@/api/endpoints/plans';
import { PlanDetail as PlanDetailType, PlanPost } from '@/api/types/plan';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import PostCard from '@/components/common/PostCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import SelectPaymentDialog from '@/components/common/SelectPaymentDialog';
import { ArrowLeft } from 'lucide-react';

export default function PlanDetail() {
  const { plan_id } = useParams<{ plan_id: string }>();
  const navigate = useNavigate();
  const planId = plan_id;

  const [planDetail, setPlanDetail] = useState<PlanDetailType | null>(null);
  const [posts, setPosts] = useState<PlanPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

	

  // プラン詳細を取得
  useEffect(() => {
    if (!planId) {
      setError('プランIDが指定されていません');
      setLoading(false);
      return;
    }

    const fetchPlanDetail = async () => {
      try {
        const data = await getPlanDetail(planId);
        setPlanDetail(data);
      } catch (err) {
        console.error('プラン詳細取得エラー:', err);
        setError('プラン詳細の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetail();
  }, [planId]);

  // 投稿一覧を取得
  const fetchPosts = useCallback(async (pageNum: number) => {
    if (!planId) return;

    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await getPlanPostsPaginated(planId, pageNum, 20);
			console.log(data);

      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }

      setHasNext(data.has_next);
    } catch (err) {
      console.error('投稿一覧取得エラー:', err);
      setError('投稿一覧の取得に失敗しました');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [planId]);

  // 初回投稿取得
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // 無限スクロール
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNext && !loadingMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNext, loadingMore]);

  // ページ変更時に投稿を追加取得
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleJoinPlan = () => {
    setShowPaymentDialog(true);
  };

  const handleCreatorClick = () => {
    if (planDetail) {
      navigate(`/account/profile?username=${planDetail.creator_username}`);
    }
  };

  // duration "MM:SS" を秒数に変換
  const durationToSeconds = (duration?: string): number | undefined => {
    if (!duration) return undefined;
    const parts = duration.split(':');
    if (parts.length !== 2) return undefined;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  };

  if (loading && !planDetail) {
    return (
      <CommonLayout header={true}>
        <Header />
        <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <BottomNavigation />
      </CommonLayout>
    );
  }

  if (error || !planDetail) {
    return (
      <CommonLayout header={true}>
        <Header />
        <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center p-6">
          <ErrorMessage message={error || 'プランが見つかりません'} variant="error" />
        </div>
        <BottomNavigation />
      </CommonLayout>
    );
  }

  return (
    <CommonLayout header={true}>
      <Header />

      <div className="min-h-screen bg-gray-50 pb-20">
        {/* カバー画像 */}
        <div className="relative">
          <div
            className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"
            style={{
              backgroundImage: planDetail.creator_cover_url ? `url(${planDetail.creator_cover_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <img
              src={planDetail.creator_avatar_url || '/assets/no-image.svg'}
              alt={planDetail.creator_name}
              className="w-24 h-24 rounded-full border-4 border-white object-cover cursor-pointer"
              onClick={handleCreatorClick}
            />
          </div>
        </div>

        {/* プラン情報カード */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-start justify-center space-x-4 mb-4">
            <div className="flex-1 pt-12 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{planDetail.name}</h2>
            </div>
          </div>

          {planDetail.description && (
            <div className="mb-4">
              <p className={`text-sm text-gray-700 whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                {planDetail.description}
              </p>
              {planDetail.description.length > 100 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-sm text-primary hover:underline mt-1 block ml-auto"
                >
                  {showFullDescription ? '閉じる' : 'もっとみる'}
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col items-center justify-center mb-4">
            <div className="flex items-center space-x-4">
						　<p className="text-lg text-gray-500">投稿数: {planDetail.post_count}件</p>
              <p className="text-3xl font-bold text-gray-900">
                ¥{planDetail.price.toLocaleString()}
                <span className="text-sm font-normal text-gray-600 ml-1">/月</span>
              </p>
            </div>
          </div>

          {!planDetail.is_subscribed && (
            <button
              onClick={handleJoinPlan}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              プランに加入
            </button>
          )}

          {planDetail.is_subscribed && (
            <div className="w-full bg-green-100 text-green-800 py-3 rounded-lg font-bold text-center">
              加入中
            </div>
          )}
        </div>

        {/* 投稿一覧 */}
        <div className="p-1">
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1 pb-24">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    post_type={post.is_video ? 1 : 2}
                    thumbnail_url={post.thumbnail_url || undefined}
                    description={post.title}
                    video_duration={durationToSeconds(post.duration)}
                    created_at={post.created_at}
                    price={post.price || undefined}
                    currency={post.currency || undefined}
                    variant="simple"
                    showTitle={false}
                    showPrice={!!post.price}
                    onClick={handlePostClick}
                  />
                ))}
              </div>

              {/* 無限スクロール用のトリガー */}
              {hasNext && (
                <div ref={observerTarget} className="flex justify-center p-4 pb-20">
                  {loadingMore && <LoadingSpinner size="md" />}
                </div>
              )}
            </>
          ) : (
            !loading && (
              <div className="p-6 text-center text-gray-500 pb-24">
                投稿がありません
              </div>
            )
          )}
        </div>
      </div>

      <BottomNavigation />

      {/* 決済ダイアログ */}
      {showPaymentDialog && planDetail && (
        <SelectPaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          planId={planDetail.id}
          planName={planDetail.name}
          amount={planDetail.price}
        />
      )}
    </CommonLayout>
  );
}
