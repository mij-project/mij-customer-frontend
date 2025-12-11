import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getPlanDetail, getPlanPostsPaginated } from '@/api/endpoints/plans';
import { PlanDetail as PlanDetailType, PlanPost } from '@/api/types/plan';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import PostCard from '@/components/common/PostCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import SelectPaymentDialog from '@/components/common/SelectPaymentDialog';
import CreditPaymentDialog from '@/components/common/CreditPaymentDialog';
import AuthDialog from '@/components/auth/AuthDialog';
import { createCredixSession } from '@/api/endpoints/credix';
import { PostDetailData } from '@/api/types/post';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';
import { useCredixPayment } from '@/hooks/useCredixPayment';
import { PurchaseType } from '@/api/types/credix';
import { createFreeSubscription } from '@/api/endpoints/subscription';
import { Button } from '@/components/ui/button';

export default function PlanDetail() {
  const { plan_id } = useParams<{ plan_id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const planId = plan_id;
  const transactionId = searchParams.get('transaction_id');

  const [planDetail, setPlanDetail] = useState<PlanDetailType | null>(null);
  const [posts, setPosts] = useState<PlanPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // ダイアログの状態管理
  const [dialogs, setDialogs] = useState({
    payment: false,
    creditPayment: false,
  });
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // CREDIX決済フック
  const {
    isCreatingSession,
    isFetchingResult,
    error: credixError,
    sessionData,
    paymentResult,
    createSession,
    fetchPaymentResult,
    clearError,
    reset: resetCredixState,
  } = useCredixPayment();

  const observerTarget = useRef<HTMLDivElement>(null);

  // プラン詳細を取得する関数
  const fetchPlanDetailData = async () => {
    if (!planId) {
      setError('プランIDが指定されていません');
      setLoading(false);
      return;
    }

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

  // プラン詳細を取得
  useEffect(() => {
    fetchPlanDetailData();
  }, [planId]);

  // CREDIXセッション作成成功時の処理
  useEffect(() => {
    if (sessionData && planDetail) {
      // CREDIX決済画面にリダイレクト
      const credixUrl = `${sessionData.payment_url}?sid=${sessionData.session_id}`;

      // transaction_idをローカルストレージに保存（戻ってきた時の決済結果確認用）
      localStorage.setItem('credix_transaction_id', sessionData.transaction_id);
      localStorage.setItem('credix_plan_id', planDetail.id);

      window.location.href = credixUrl;
    }
  }, [sessionData, planDetail]);

  // CREDIX決済画面から戻ってきた時の処理
  useEffect(() => {
    if (transactionId) {
      // 決済結果を取得
      fetchPaymentResult(transactionId);

      // URLパラメータからtransaction_idを削除
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('transaction_id');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [transactionId]);

  // 決済結果取得後の処理
  useEffect(() => {
    if (paymentResult) {
      if (paymentResult.result === 'success') {
        alert('決済が完了しました！');
        // ページをリフレッシュして購入済みステータスを反映
        fetchPlanDetailData();
        resetCredixState();
        localStorage.removeItem('credix_transaction_id');
        localStorage.removeItem('credix_plan_id');
      } else if (paymentResult.result === 'failure') {
        alert('決済に失敗しました。もう一度お試しください。');
        resetCredixState();
        localStorage.removeItem('credix_transaction_id');
        localStorage.removeItem('credix_plan_id');
      } else {
        // pending状態の場合は3秒後に再度確認
        setTimeout(() => {
          if (transactionId) {
            fetchPaymentResult(transactionId);
          }
        }, 3000);
      }
    }
  }, [paymentResult]);

  // CREDIXエラー表示
  useEffect(() => {
    if (credixError) {
      alert(credixError);
      clearError();
    }
  }, [credixError]);

  // 投稿一覧を取得
  const fetchPosts = useCallback(
    async (pageNum: number) => {
      if (!planId) return;

      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const data = await getPlanPostsPaginated(planId, pageNum, 20);

        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }

        setHasNext(data.has_next);
      } catch (err) {
        console.error('投稿一覧取得エラー:', err);
        setError('投稿一覧の取得に失敗しました');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [planId]
  );

  // 初回投稿取得
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // 無限スクロール
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loadingMore) {
          setPage((prev) => prev + 1);
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

  const handleJoinPlan = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    // 0円プランの場合は即座に加入処理
    if (planDetail && planDetail.price === 0) {
      try {
        await createFreeSubscription({
          purchase_type: 2, // SUBSCRIPTION
          order_id: planDetail.id,
        });
        alert('プランに加入しました！');
        // ページをリフレッシュして加入済みステータスを反映
        fetchPlanDetailData();
      } catch (error) {
        console.error('0円プラン加入エラー:', error);
        alert('プランへの加入に失敗しました。');
      }
      return;
    }

    setDialogs((prev) => ({ ...prev, payment: true }));
  };

  const handleCreatorClick = () => {
    if (planDetail) {
      navigate(`/profile?username=${planDetail.creator_username}`);
    }
  };

  const handleEditPlan = () => {
    if (planDetail) {
      navigate(`/plan/edit/${planDetail.id}`);
    }
  };

  // 自分のプランかどうかを判定
  const isOwnPlan = user && planDetail && user.id === planDetail.creator_id;

  // duration "MM:SS" を秒数に変換
  const durationToSeconds = (duration?: string): number | undefined => {
    if (!duration) return undefined;
    const parts = duration.split(':');
    if (parts.length !== 2) return undefined;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  };

  // 共通のダイアログクローズ関数
  const closeDialog = (dialogName: keyof typeof dialogs) => {
    setDialogs((prev) => ({ ...prev, [dialogName]: false }));
  };

  // 決済実行ハンドラー
  const handlePayment = async () => {
    if (!planDetail) return;

    try {
      // CREDIXセッション作成（plan_idのみ）
      await createSession({
        orderId: planDetail.id, // プランIDを仮で使用
        purchaseType: PurchaseType.SUBSCRIPTION,
        planId: planDetail.id,
      });
    } catch (error) {
      console.error('Failed to create CREDIX session:', error);
      alert('決済セッションの作成に失敗しました。もう一度お試しください。');
    }
  };

  // PlanDetailTypeをPostDetailData形式に変換（SelectPaymentDialog用）
  const convertPlanDetailToPostData = (plan: PlanDetailType): PostDetailData | undefined => {
    if (!plan) return undefined;

    return {
      id: plan.id,
      post_main_duration: 0,
      post_type: 1, // プランの場合は仮で動画(1)を設定
      description: plan.description || '',
      thumbnail_key: plan.creator_avatar_url || '',
      creator: {
        user_id: plan.creator_id,
        username: plan.creator_username,
        profile_name: plan.creator_name,
        official: user?.offical_flg || false,
        avatar: plan.creator_avatar_url || '',
      },
      categories: [],
      media_info: [],
      sale_info: {
        price: null,
        plans: [
          {
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            price: plan.price,
          },
        ],
      },
      post_main_duration: 0,
    };
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
          <div className="flex items-center justify-between absolute top-0 left-0">
            <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="text-gray-600 hover:bg-transparent">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          <div
            className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"
            style={{
              backgroundImage: planDetail.creator_cover_url
                ? `url(${planDetail.creator_cover_url})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
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
              <p
                className={`text-sm text-gray-700 whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-3' : ''}`}
              >
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

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <p className="text-md text-gray-500">投稿数: {planDetail.post_count}件</p>
              <p className="text-md font-bold text-gray-900">
                ¥{planDetail.price.toLocaleString()}
                <span className="text-sm font-normal text-gray-600 ml-1">/月</span>
              </p>
            </div>

            {isOwnPlan ? (
              <button
                onClick={handleEditPlan}
                className="bg-primary text-white px-4 py-2 rounded-md font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                編集
              </button>
            ) : (
              <>
                {!planDetail.is_subscribed && (
                  <button
                    onClick={handleJoinPlan}
                    className="bg-primary text-white px-4 py-2 rounded-md font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    プランに加入
                  </button>
                )}

                {planDetail.is_subscribed && (
                  <button
                    disabled
                    className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md font-bold cursor-not-allowed whitespace-nowrap"
                  >
                    加入済み
                  </button>
                )}
              </>
            )}
          </div>
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
                    title={post.title || undefined}
                    post_type={post.is_video ? 1 : 2}
                    thumbnail_url={post.thumbnail_url || undefined}
                    description={post.title}
                    video_duration={durationToSeconds(post.duration)}
                    created_at={post.created_at}
                    price={post.price || undefined}
                    currency={post.currency || undefined}
                    variant="simple"
                    showTitle={true}
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
            !loading && <div className="p-6 text-center text-gray-500 pb-24">投稿がありません</div>
          )}
        </div>
      </div>

      <BottomNavigation />

      {/* 支払い方法選択ダイアログ */}
      {planDetail && (
        <SelectPaymentDialog
          isOpen={dialogs.payment}
          onClose={() => closeDialog('payment')}
          post={convertPlanDetailToPostData(planDetail)}
          onPayment={handlePayment}
        />
      )}


      {/* AuthDialog */}
      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
    </CommonLayout>
  );
}
