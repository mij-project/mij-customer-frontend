import React, { useEffect, useState } from 'react';
import BottomNavigation from '@/components/common/BottomNavigation';
import OgpMeta from '@/components/common/OgpMeta';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PostDetailData } from '@/api/types/post';
import { getPostDetail, getPostOgpImage } from '@/api/endpoints/post';
import SelectPaymentDialog from '@/components/common/SelectPaymentDialog';
import CreditPaymentDialog from '@/components/common/CreditPaymentDialog';
import { createCredixSession } from '@/api/endpoints/credix';
import VerticalVideoCard from '@/components/video/VerticalVideoCard';
import AuthDialog from '@/components/auth/AuthDialog';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCredixPayment } from '@/hooks/useCredixPayment';
import { PurchaseType } from '@/api/types/credix';
import { createFreeSubscription } from '@/api/endpoints/subscription';
import { useAuth } from '@/providers/AuthContext';
import PostInvisible from '@/components/common/PostInvisible';
import { AxiosError } from 'axios';
import CredixNotification from '@/components/common/CredixNotification';

export default function PostDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const postId = searchParams.get('post_id');
  const transactionId = searchParams.get('transaction_id');

  const [currentPost, setCurrentPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ogpImageUrl, setOgpImageUrl] = useState<string | null>(null);

  // ダイアログの状態を管理
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [purchaseType, setPurchaseType] = useState<'single' | 'subscription' | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [showPostInvisible, setShowPostInvisible] = useState(false);

  const [showPaymentCredixNotification, setShowPaymentCredixNotification] = useState(false);
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

  const handlePurchaseClick = async () => {
    // ログインチェック
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    // 0円の単品購入の場合は直接購入処理を実行
    if (currentPost?.sale_info.price?.price === 0) {
      try {
        const orderId = currentPost.sale_info.price.id;
        if (!orderId) {
          alert('購入情報が見つかりません。');
          return;
        }

        await createFreeSubscription({
          purchase_type: 1, // SINGLE
          order_id: orderId,
        });

        alert('商品を購入しました。');
        // ページをリフレッシュして購入済みステータスを反映
        fetchPostDetail();
      } catch (error) {
        console.error('0円商品購入エラー:', error);
        alert('購入に失敗しました。');
      }
      return;
    }

    // 有料の場合は決済ダイアログを表示
    setShowPaymentDialog(true);
  };

  const handlePurchaseTypeSelect = (type: 'single' | 'subscription', planId?: string) => {
    setPurchaseType(type);
    setSelectedPlanId(planId || null);
  };

  const handlePaymentDialogClose = () => {
    setShowPaymentDialog(false);
    setPurchaseType(null);
    setSelectedPlanId(null);
  };

  // fetchPostDetail関数を抽出
  const fetchPostDetail = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const data = await getPostDetail(postId);

      setCurrentPost(data);

      // OGP画像URLを取得
      const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
      const defaultOgpImage = `${baseUrl}/assets/mijfans.png`;

      const ogpData = await getPostOgpImage(postId);
      setOgpImageUrl(ogpData.ogp_image_url || defaultOgpImage);
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
      const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
      setOgpImageUrl(`${baseUrl}/assets/mijfans.png`);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!currentPost || !purchaseType) return;

    try {
      // 0円商品・プランの場合は即座に加入処理
      const isSubscription = purchaseType === 'subscription';

      // 選択されたプランを取得
      const selectedPlan =
        isSubscription && selectedPlanId
          ? currentPost.sale_info.plans.find((plan) => plan.id === selectedPlanId)
          : null;

      const price = isSubscription ? selectedPlan?.price : currentPost.sale_info.price?.price;

      if (price === 0) {
        const orderId = isSubscription ? selectedPlan?.id : currentPost.sale_info.price?.id;

        if (!orderId) {
          alert('購入情報が見つかりません。');
          return;
        }

        await createFreeSubscription({
          purchase_type: isSubscription ? 2 : 1, // 2=SUBSCRIPTION, 1=SINGLE
          order_id: orderId,
        });

        alert(isSubscription ? 'プランに加入しました。' : '商品を購入しました。');
        // ページをリフレッシュして購入済みステータスを反映
        fetchPostDetail();
        handlePaymentDialogClose();
        return;
      }
      let is_time_sale = false;
      if (purchaseType === 'single' && currentPost.sale_info.price?.is_time_sale_active) {
        is_time_sale = true;
      }
      if (purchaseType === 'subscription' && selectedPlan?.is_time_sale_active) {
        is_time_sale = true;
      }

      // 有料の場合はCREDIX決済へ
      await createSession({
        orderId: purchaseType === 'subscription' ? selectedPlan?.id : currentPost.id,
        purchaseType: purchaseType === 'single' ? PurchaseType.SINGLE : PurchaseType.SUBSCRIPTION,
        planId: purchaseType === 'subscription' ? selectedPlan?.id : undefined,
        priceId: purchaseType === 'single' ? currentPost.sale_info.price?.id : undefined,
        is_time_sale: is_time_sale,
      });
    } catch (error) {
      console.error('Failed to create CREDIX session:', error);
      if (error instanceof AxiosError && error.response?.status === 402) {
        setShowPaymentCredixNotification(true);
        return;
      }
      alert('決済セッションの作成に失敗しました。もう一度お試しください。');
    }
  };

  // CREDIXセッション作成成功時の処理
  useEffect(() => {
    if (sessionData) {
      // CREDIX決済画面にリダイレクト
      const credixUrl = `${sessionData.payment_url}?sid=${sessionData.session_id}`;

      // transaction_idをローカルストレージに保存（戻ってきた時の決済結果確認用）
      localStorage.setItem('credix_transaction_id', sessionData.transaction_id);
      localStorage.setItem('credix_post_id', currentPost?.id || '');

      window.location.href = credixUrl;
    }
  }, [sessionData, currentPost]);

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
        fetchPostDetail();
        resetCredixState();
        localStorage.removeItem('credix_transaction_id');
        localStorage.removeItem('credix_post_id');
      } else if (paymentResult.result === 'failure') {
        alert('決済に失敗しました。もう一度お試しください。');
        resetCredixState();
        localStorage.removeItem('credix_transaction_id');
        localStorage.removeItem('credix_post_id');
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

  useEffect(() => {
    fetchPostDetail();
  }, [postId]);

  useEffect(() => {
    if (!currentPost) return;
    if (currentPost.is_purchased) return;
    if (currentPost.is_scheduled || currentPost.is_expired) {
      setShowPostInvisible(true);
    }
  }, [currentPost]);

  // 実際の表示可能な高さを計算
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // モバイルでのスクロールを無効化 & ビューポート高さを動的に更新
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalHtmlStyle = window.getComputedStyle(document.documentElement).overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.documentElement.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    // ビューポート高さを更新（アドレスバーの表示/非表示に対応）
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      document.body.style.overflow = originalStyle;
      document.documentElement.style.overflow = originalHtmlStyle;
      document.body.style.touchAction = '';
      document.documentElement.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white">投稿が見つかりません</div>
      </div>
    );
  }

  const pageTitle = currentPost?.description
    ? `${currentPost.description.substring(0, 60)}${currentPost.description.length > 60 ? '...' : ''} | mijfans`
    : 'mijfans - クリエイターコンテンツプラットフォーム';
  const pageDescription = currentPost?.description || '世界へ飛び立つファンクラブプラットフォーム';

  return (
    <>
      <OgpMeta
        title={pageTitle}
        description={pageDescription}
        imageUrl={ogpImageUrl}
        type="article"
        twitterCard="summary_large_image"
      />

      <div
        className="w-full bg-black overflow-hidden relative"
        style={
          {
            height: `${viewportHeight}px`,
            touchAction: 'none',
            overscrollBehavior: 'none',
          } as React.CSSProperties
        }
      >
        {/* メディア表示エリア - VerticalVideoCardを使用（実際の表示可能高さ） */}
        <div
          className="overflow-hidden w-full flex justify-center"
          style={
            {
              height: `${viewportHeight}px`,
              touchAction: 'none',
              overscrollBehavior: 'none',
            } as React.CSSProperties
          }
        >
          <div className="w-full max-w-md mx-auto h-full">
            <VerticalVideoCard
              post={currentPost}
              isActive={true}
              onVideoClick={() => {}}
              onPurchaseClick={handlePurchaseClick}
              onAuthRequired={() => setShowAuthDialog(true)}
              isOverlayOpen={showPaymentDialog || showAuthDialog || showPostInvisible}
            />
          </div>
        </div>

        {/* 固定配置のナビゲーション（動画の上にオーバーレイ） */}
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full">
          <BottomNavigation />
        </div>

        {/* 購入・支払いダイアログ（統合版） */}
        {currentPost && (
          <SelectPaymentDialog
            isOpen={showPaymentDialog}
            onClose={handlePaymentDialogClose}
            post={currentPost}
            onPurchaseTypeSelect={handlePurchaseTypeSelect}
            onPayment={handlePayment}
          />
        )}

        {/* AuthDialog */}
        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />

        {/* PostInvisible */}
        <PostInvisible isOpen={showPostInvisible} onClose={() => setShowPostInvisible(false)} />

        {/* CredixNotification */}
        <CredixNotification isOpen={showPaymentCredixNotification} onClose={() => setShowPaymentCredixNotification(false)} />
      </div>
    </>
  );
}
