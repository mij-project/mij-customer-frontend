import React, { useEffect, useState } from 'react';
import BottomNavigation from '@/components/common/BottomNavigation';
import OgpMeta from '@/components/common/OgpMeta';
import { useSearchParams } from 'react-router-dom';
import { PostDetailData } from '@/api/types/post';
import { getPostDetail, getPostOgpImage } from '@/api/endpoints/post';
import PurchaseDialog from '@/components/common/PurchaseDialog';
import SelectPaymentDialog from '@/components/common/SelectPaymentDialog';
import CreditPaymentDialog from '@/components/common/CreditPaymentDialog';
import { createPurchase } from '@/api/endpoints/purchases';
import VerticalVideoCard from '@/components/video/VerticalVideoCard';
import AuthDialog from '@/components/auth/AuthDialog';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PostDetail() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('post_id');
  const [currentPost, setCurrentPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ogpImageUrl, setOgpImageUrl] = useState<string | null>(null);

  // ダイアログの状態をオブジェクトで管理
  const [dialogs, setDialogs] = useState({
    purchase: false,
    payment: false,
    creditPayment: false,
    bankTransfer: false,
  });
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [purchaseType, setPurchaseType] = useState<'single' | 'subscription' | null>(null);

  const handlePurchaseClick = () => {
    setDialogs((prev) => ({ ...prev, purchase: true }));
  };

  const handlePurchaseConfirm = (type: 'single' | 'subscription') => {
    setPurchaseType(type);
    setDialogs((prev) => ({ ...prev, purchase: false, payment: true }));
  };

  const handlePaymentMethodSelect = (method: string) => {
    if (method === 'credit_card') {
      setDialogs((prev) => ({ ...prev, payment: false, creditPayment: true }));
    } else if (method === 'bank_transfer') {
      setDialogs((prev) => ({ ...prev, payment: false, bankTransfer: true }));
    } else {
      setDialogs((prev) => ({ ...prev, payment: false }));
    }
  };

  // 共通のダイアログクローズ関数
  const closeDialog = (dialogName: keyof typeof dialogs) => {
    setDialogs((prev) => ({ ...prev, [dialogName]: false }));
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
    if (!currentPost) return;

    // const selectedPlan = purchaseType === 'single'
    //   ? currentPost.sale_info.plans[0]?.id
    //   : currentPost.sale_info.plans[0]?.id;

    // const formData = {
    //   item_type: purchaseType || 'single',
    //   post_id: currentPost.id,
    //   plan_id: selectedPlan,
    // }

    // try {
    //   const res = await createPurchase(formData);

    //   if (res.status === 200) {
    //     await fetchPostDetail();
    //     setTimeout(() => {
    //       closeDialog('creditPayment');
    //       closeDialog('payment');
    //       closeDialog('purchase');
    //       closeDialog('bankTransfer');
    //     }, 100);
    //   }
    // } catch (error) {
    //   console.error('Failed to create purchase:', error);
    // }
  };

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

        {/* 購入ダイアログ */}
        {currentPost && (
          <PurchaseDialog
            isOpen={dialogs.purchase}
            onClose={() => closeDialog('purchase')}
            post={currentPost}
            onPurchase={handlePurchaseConfirm}
          />
        )}

        {/* 支払いダイアログ */}
        {currentPost && (
          <SelectPaymentDialog
            isOpen={dialogs.payment}
            onClose={() => closeDialog('payment')}
            post={currentPost}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            purchaseType={purchaseType}
          />
        )}

        {/* クレジットカード決済ダイアログ */}
        {currentPost && dialogs.creditPayment && (
          <CreditPaymentDialog
            isOpen={dialogs.creditPayment}
            onClose={() => closeDialog('creditPayment')}
            onPayment={handlePayment}
            post={currentPost}
            purchaseType={purchaseType}
          />
        )}

        {/* AuthDialog */}
        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
      </div>
    </>
  );
}
