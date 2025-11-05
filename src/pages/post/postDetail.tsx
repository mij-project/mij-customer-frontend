import React, { useEffect, useState } from 'react';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useSearchParams } from 'react-router-dom';
import { PostDetailData } from '@/api/types/post';
import { getPostDetail } from '@/api/endpoints/post';
import PurchaseDialog from '@/components/common/PurchaseDialog';
import SelectPaymentDialog from '@/components/common/SelectPaymentDialog';
import CreditPaymentDialog from '@/components/common/CreditPaymentDialog';
import { createPurchase } from '@/api/endpoints/purchases';
import VerticalVideoCard from '@/components/video/VerticalVideoCard';

export default function PostDetail() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('post_id');
  const [currentPost, setCurrentPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // ダイアログの状態をオブジェクトで管理
  const [dialogs, setDialogs] = useState({
    purchase: false,
    payment: false,
    creditPayment: false,
    bankTransfer: false
  });

  const [purchaseType, setPurchaseType] = useState<'single' | 'subscription' | null>(null);

  const handlePurchaseClick = () => {
    setDialogs(prev => ({ ...prev, purchase: true }));
  };

  const handlePurchaseConfirm = (type: 'single' | 'subscription') => {
    setPurchaseType(type);
    setDialogs(prev => ({ ...prev, purchase: false, payment: true }));
  };

  const handlePaymentMethodSelect = (method: string) => {
    if (method === 'credit_card') {
      setDialogs(prev => ({ ...prev, payment: false, creditPayment: true }));
    } else if (method === 'bank_transfer') {
      setDialogs(prev => ({ ...prev, payment: false, bankTransfer: true }));
    } else {
      setDialogs(prev => ({ ...prev, payment: false }));
    }
  };

  // 共通のダイアログクローズ関数
  const closeDialog = (dialogName: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [dialogName]: false }));
  };

  // fetchPostDetail関数を抽出
  const fetchPostDetail = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const data = await getPostDetail(postId);
      setCurrentPost(data);
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
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

  return (
    <div
      className="w-full h-screen bg-black overflow-hidden relative"
      style={{ ['--nav-h' as any]: '72px' }}
    >
      {/* メディア表示エリア - VerticalVideoCardを使用 */}
      <VerticalVideoCard
        post={currentPost}
        isActive={true}
        onVideoClick={() => {}}
        onPurchaseClick={handlePurchaseClick}
      />

      {/* 絶対配置のナビゲーション */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
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
    </div>
  );
}
