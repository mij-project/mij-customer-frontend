import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SelectPaymentDialog from '@/components/common/SelectPaymentDialog';
import CreditPaymentDialog from '@/components/common/CreditPaymentDialog';
import { createPurchase } from '@/api/endpoints/purchases';
import { PostDetailData } from '@/api/types/post';

interface Post {
  id: string;
  likes_count: number;
  description?: string;
  thumbnail_url?: string;
  video_duration?: number;
  created_at: string;
}

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
}

interface IndividualPurchase {
  id: string;
  likes_count: number;
  description?: string;
  thumbnail_url?: string;
  video_duration?: number;
  created_at: string;
}

interface GachaItem {
  id: string;
  amount: number;
  created_at: string;
}

interface ContentSectionProps {
  activeTab: 'posts' | 'plans' | 'individual' | 'gacha';
  posts: Post[];
  plans: Plan[];
  individualPurchases: IndividualPurchase[];
  gachaItems: GachaItem[];
}

const NO_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEwMCAxMDBaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTRBRiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

export default function ContentSection({
  activeTab,
  posts,
  plans,
  individualPurchases,
  gachaItems
}: ContentSectionProps) {
  const navigate = useNavigate();

  console.log('plans', plans);

  // ダイアログの状態をオブジェクトで管理
  const [dialogs, setDialogs] = useState({
    payment: false,
    creditPayment: false,
  });

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchaseType] = useState<'subscription'>('subscription');

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  // プラン加入ボタンのクリックハンドラー（PurchaseDialogをスキップして直接SelectPaymentDialogを表示）
  const handlePlanJoin = (plan: Plan) => {
    setSelectedPlan(plan);
    setDialogs(prev => ({ ...prev, payment: true }));
  };

  // 支払い方法選択後のハンドラー
  const handlePaymentMethodSelect = (method: string) => {
    if (method === 'credit_card') {
      setDialogs(prev => ({ ...prev, payment: false, creditPayment: true }));
    } else {
      // 他の支払い方法の処理
      setDialogs(prev => ({ ...prev, payment: false }));
    }
  };

  // 共通のダイアログクローズ関数
  const closeDialog = (dialogName: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [dialogName]: false }));
  };

  // 決済実行ハンドラー
  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      const res = await createPurchase({
        plan_id: selectedPlan.id
      });

      if (res) {
        // 決済成功後の処理
        setTimeout(() => {
          closeDialog('creditPayment');
          closeDialog('payment');
          alert('プランへの加入が完了しました！');
          // ページをリロードして最新の状態を反映
          window.location.reload();
        }, 100); // 少し遅延させる
      }
    } catch (error) {
      console.error('決済エラー:', error);
      alert('決済に失敗しました。もう一度お試しください。');
    }
  };

  // PostDetailData形式に変換（SelectPaymentDialog用）
  const convertPlanToPostData = (plan: Plan): PostDetailData | undefined => {

    console.log('plan', plan);
    if (!plan) return undefined;

    return {
      id: plan.id,
      title: plan.name,
      description: plan.description || '',
      thumbnail: '/assets/no-image.svg',
      video_url: '',
      sample_video_url: '',
      main_video_duration: '0:00',
      sample_video_duration: '0:00',
      likes: 0,
      purchased: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      categories: [],
      media_assets: {},
      creator: {
        name: '',
        profile_name: '',
        avatar: '/assets/no-image.svg',
        verified: false
      },
      subscription: {
        id: plan.id,
        plan_name: plan.name,
        plan_description: plan.description || '',
        amount: plan.price,
        currency: plan.currency,
        interval: null
      },
      single: {
        id: '',
        amount: 0,
        currency: 'JPY'
      }
    } as PostDetailData;
  };

  const renderEmptyState = (type: string) => (
    <div className="p-6 text-center text-gray-500">
      {type}はありません。
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 p-1 pb-24">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="relative">
                  <img 
                    src={post.thumbnail_url || NO_IMAGE_URL} 
                    alt={post.description || '投稿画像'} 
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.currentTarget.src = NO_IMAGE_URL;
                    }}
                  />
                  {post.video_duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(post.video_duration)}
                    </div>
                  )}
                  {/* いいね数を画像に被せて表示 */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('投稿');
      case 'plans':
        return plans.length > 0 ? (
          <div className="p-6 space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{plan.name}</h3>
                    {plan.description && <p className="text-sm text-gray-600">{plan.description}</p>}
                    {/* <p className="text-sm font-medium text-primary">月額料金 ¥{plan.price.toLocaleString()}/月</p> */}
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => handlePlanJoin(plan)}
                  >
                    加入
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('プラン');
      case 'individual':
        return individualPurchases.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 p-1 pb-24">
             {individualPurchases.map((post) => (
              <div 
                key={post.id} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="relative">
                  <img 
                    src={post.thumbnail_url || NO_IMAGE_URL} 
                    alt={post.description || '投稿画像'} 
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.currentTarget.src = NO_IMAGE_URL;
                    }}
                  />
                  {post.video_duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(post.video_duration)}
                    </div>
                  )}
                  {/* いいね数を画像に被せて表示 */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('単品購入');
      case 'gacha':
        return gachaItems.length > 0 ? (
          <div className="p-6 space-y-4">
            {gachaItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img src={NO_IMAGE_URL} alt="ガチャアイテム" className="w-20 h-16 object-cover rounded" />
                    <Star className="absolute top-1 left-1 h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">ガチャアイテム</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm font-medium text-primary">¥{item.amount.toLocaleString()}</span>
                      <span className="text-sm text-gray-600">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : renderEmptyState('ガチャ');
      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}

      {/* 支払い方法選択ダイアログ */}
      {selectedPlan && (
        <SelectPaymentDialog
          isOpen={dialogs.payment}
          onClose={() => closeDialog('payment')}
          post={convertPlanToPostData(selectedPlan)}
          onPaymentMethodSelect={handlePaymentMethodSelect}
          purchaseType={purchaseType}
        />
      )}

      {/* クレジットカード決済ダイアログ */}
      {selectedPlan && dialogs.creditPayment && (
        <CreditPaymentDialog
          isOpen={dialogs.creditPayment}
          onClose={() => closeDialog('creditPayment')}
          post={convertPlanToPostData(selectedPlan)!}
          onPayment={handlePayment}
          purchaseType={purchaseType}
        />
      )}
    </>
  );
}