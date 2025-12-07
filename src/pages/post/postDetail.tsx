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

export default function PostDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const postId = searchParams.get('post_id');
  const transactionId = searchParams.get('transaction_id');

  const [currentPost, setCurrentPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ogpImageUrl, setOgpImageUrl] = useState<string | null>(null);

  // ダイアログの状態を管理
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [purchaseType, setPurchaseType] = useState<'single' | 'subscription' | null>(null);

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

  const handlePurchaseClick = () => {
    setShowPaymentDialog(true);
  };

  const handlePurchaseTypeSelect = (type: 'single' | 'subscription') => {
    setPurchaseType(type);
  };

  const handlePaymentDialogClose = () => {
    setShowPaymentDialog(false);
    setPurchaseType(null);
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
      // CREDIXセッション作成（電話番号は不要）
      await createSession({
        orderId:
          purchaseType === 'subscription'
            ? currentPost.sale_info.plans[0]?.id
            : currentPost.id,
        purchaseType: purchaseType === 'single' ? PurchaseType.SINGLE : PurchaseType.SUBSCRIPTION,
        planId: purchaseType === 'subscription' ? currentPost.sale_info.plans[0]?.id : undefined,
        priceId: purchaseType === 'single' ? currentPost.sale_info.price?.id : undefined,
      });
    } catch (error) {
      console.error('Failed to create CREDIX session:', error);
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
        style={{
          height: `${viewportHeight}px`,
          touchAction: 'none',
          overscrollBehavior: 'none'
        } as React.CSSProperties}
      >
        {/* メディア表示エリア - VerticalVideoCardを使用（実際の表示可能高さ） */}
        <div className="overflow-hidden w-full" style={{ height: `${viewportHeight}px`, touchAction: 'none', overscrollBehavior: 'none' } as React.CSSProperties}>
          <VerticalVideoCard
            post={currentPost}
            isActive={true}
            onVideoClick={() => { }}
            onPurchaseClick={handlePurchaseClick}
            onAuthRequired={() => setShowAuthDialog(true)}
          />
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
      </div>
    </>
  );
}
