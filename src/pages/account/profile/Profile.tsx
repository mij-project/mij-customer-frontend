import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import OgpMeta from '@/components/common/OgpMeta';
import SEOHead from '@/components/seo/SEOHead';
import AccountLayout from '@/features/account/components/AccountLayout';
import AccountNavigation from '@/features/account/components/AccountNavigation';
import { getUserProfileByUsername, getUserOgpImage } from '@/api/endpoints/user';
import { UserProfile } from '@/api/types/profile';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useAuth } from '@/providers/AuthContext';
import { getLikedPosts, getBookmarkedPosts } from '@/api/endpoints/account';
import TopBuyerSection from '@/features/account/profile/TopBuyeSection';

// セクションコンポーネントをインポート
import ProfileHeaderSection from '@/features/account/profile/ProfileHeaderSection';
import ProfileInfoSection from '@/features/account/profile/ProfileInfoSection';
import HorizontalPlanList from '@/features/account/profile/HorizontalPlanList';
import ContentSection from '@/features/account/profile/ContentSection';
import SelectPaymentDialog from '@/components/common/SelectPaymentDialog';
import CreditPaymentDialog from '@/components/common/CreditPaymentDialog';
import { PostDetailData } from '@/api/types/post';
import { ProfilePlan } from '@/api/types/profile';
import AuthDialog from '@/components/auth/AuthDialog';
import { useCredixPayment } from '@/hooks/useCredixPayment';
import { PurchaseType } from '@/api/types/credix';
import { createFreeSubscription } from '@/api/endpoints/subscription';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'posts' | 'plans' | 'individual' | 'gacha' | 'videos' | 'images' | 'likes' | 'bookmarks'
  >('posts');
  const [ogpImageUrl, setOgpImageUrl] = useState<string | null>(null);
  const transactionId = searchParams.get('transaction_id');
  const navigationRef = React.useRef<HTMLDivElement>(null);

  // いいね・保存済み投稿のstate
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<any[]>([]);
  const [likesLoading, setLikesLoading] = useState(false);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  // ダイアログの状態管理
  const [dialogs, setDialogs] = useState({
    payment: false,
    creditPayment: false,
  });
  const [selectedPlan, setSelectedPlan] = useState<ProfilePlan | null>(null);
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

  const username = searchParams.get('username');

  // プロフィールデータ取得関数
  const fetchProfileData = async () => {
    if (!username) {
      setError('ユーザー名が指定されていません');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserProfileByUsername(username);
      setProfile(data);

      // OGP画像URLを取得
      const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
      const defaultOgpImage = `${baseUrl}/assets/mijfans.png`;

      if (data.id) {
        try {
          const ogpData = await getUserOgpImage(data.id);
          setOgpImageUrl(ogpData.ogp_image_url || defaultOgpImage);
        } catch (error) {
          console.error('OGP画像取得エラー:', error);
          setOgpImageUrl(defaultOgpImage);
        }
      }

      // 自分のプロフィールの場合、いいね・保存済みデータも取得
      if (user?.id === data.id) {
        // いいねデータ取得
        setLikesLoading(true);
        try {
          const likedData = await getLikedPosts();
          setLikedPosts(likedData.liked_posts || []);
        } catch (error) {
          console.error('いいね投稿の取得エラー:', error);
        } finally {
          setLikesLoading(false);
        }

        // 保存済みデータ取得
        setBookmarksLoading(true);
        try {
          const bookmarkedData = await getBookmarkedPosts();
          setBookmarkedPosts(bookmarkedData.bookmarks || []);
        } catch (error) {
          console.error('保存済み投稿の取得エラー:', error);
        } finally {
          setBookmarksLoading(false);
        }
      }
    } catch (err) {
      setError('プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username, user?.id]);

  // sessionStorageからactiveTabとスクロール位置を復元
  useEffect(() => {
    const savedTab = sessionStorage.getItem('profileActiveTab');
    const savedScrollPosition = sessionStorage.getItem('profileScrollPosition');

    if (savedTab) {
      console.log('Restoring activeTab to:', savedTab);
      setActiveTab(savedTab as 'posts' | 'plans' | 'individual' | 'gacha' | 'videos' | 'images' | 'likes' | 'bookmarks');

      // スクロール位置を復元
      if (savedScrollPosition) {
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedScrollPosition, 10),
            behavior: 'smooth'
          });
        }, 100);
      }

      // sessionStorageをクリア
      sessionStorage.removeItem('profileActiveTab');
      sessionStorage.removeItem('profileScrollPosition');
    }
  }, []);

  // CREDIXセッション作成成功時の処理
  useEffect(() => {
    if (sessionData && selectedPlan) {
      // CREDIX決済画面にリダイレクト
      const credixUrl = `${sessionData.payment_url}?sid=${sessionData.session_id}`;

      // transaction_idをローカルストレージに保存（戻ってきた時の決済結果確認用）
      localStorage.setItem('credix_transaction_id', sessionData.transaction_id);
      localStorage.setItem('credix_plan_id', selectedPlan.id);

      window.location.href = credixUrl;
    }
  }, [sessionData, selectedPlan]);

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
        fetchProfileData();
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

  if (loading) return <div className="p-6 text-center">読み込み中...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!profile) return <div className="p-6 text-center">プロフィールが見つかりません</div>;

  // 自分のプロフィールかどうかを判定
  const isOwnProfile = user?.id === profile.id;

  // 動画・画像の件数を計算
  const videosCount = isOwnProfile ? profile.posts.filter((post) => post.post_type === 1).length : profile.posts.filter((post) => post.post_type === 1 && !post.is_reserved).length;
  const imagesCount = isOwnProfile ? profile.posts.filter((post) => post.post_type === 2).length : profile.posts.filter((post) => post.post_type === 2 && !post.is_reserved).length;
  const postsCount = isOwnProfile ? profile.posts.length : profile.posts.filter((post) => !post.is_reserved).length;
  const individualPurchasesCount = isOwnProfile ? profile.individual_purchases.length : profile.individual_purchases.filter((purchase) => !purchase.is_reserved).length;
  
  const navigationItems = [
    { id: 'posts', label: '投稿', count: postsCount, isActive: activeTab === 'posts' },
    { id: 'videos', label: '動画', count: videosCount, isActive: activeTab === 'videos' },
    { id: 'images', label: '画像', count: imagesCount, isActive: activeTab === 'images' },
    { id: 'plans', label: 'プラン', count: profile.plans.length, isActive: activeTab === 'plans' },
    {
      id: 'individual',
      label: '単品購入',
      count: individualPurchasesCount,
      isActive: activeTab === 'individual',
    },
    // 自分のプロフィールの場合のみ「いいね」「保存済み」タブを表示
    ...(isOwnProfile
      ? [
        {
          id: 'likes',
          label: 'いいね',
          count: likedPosts.length,
          isActive: activeTab === 'likes',
        },
        {
          id: 'bookmarks',
          label: '保存済み',
          count: bookmarkedPosts.length,
          isActive: activeTab === 'bookmarks',
        },
      ]
      : []),
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(
      tabId as
      | 'posts'
      | 'plans'
      | 'individual'
      | 'gacha'
      | 'videos'
      | 'images'
      | 'likes'
      | 'bookmarks'
    );
  };

  // プラン加入ハンドラー
  const handlePlanJoin = async (plan: ProfilePlan) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    // 0円プランの場合は即座に加入処理
    if (plan.price === 0) {
      try {
        await createFreeSubscription({
          purchase_type: 2, // SUBSCRIPTION
          order_id: plan.id,
        });
        alert('プランに加入しました。');
        // ページをリフレッシュして加入済みステータスを反映
        fetchProfileData();
      } catch (error) {
        console.error('0円プラン加入エラー:', error);
        alert('プランへの加入に失敗しました。');
      }
      return;
    }

    setSelectedPlan(plan);
    setDialogs((prev) => ({ ...prev, payment: true }));
  };

  // 共通のダイアログクローズ関数
  const closeDialog = (dialogName: keyof typeof dialogs) => {
    setDialogs((prev) => ({ ...prev, [dialogName]: false }));
  };

  // 決済実行ハンドラー
  const handlePayment = async () => {
    if (!selectedPlan || !profile) return;

    try {
      // CREDIXセッション作成（plan_idのみ）
      await createSession({
        orderId: selectedPlan.id, // ユーザープロフィールのIDを仮で使用
        purchaseType: PurchaseType.SUBSCRIPTION,
        planId: selectedPlan.id,
      });
    } catch (error) {
      console.error('Failed to create CREDIX session:', error);
      alert('決済セッションの作成に失敗しました。もう一度お試しください。');
    }
  };

  // PostDetailData形式に変換（SelectPaymentDialog用）
  const convertPlanToPostData = (plan: ProfilePlan): PostDetailData | undefined => {
    if (!plan) return undefined;

    return {
      id: plan.id,
      is_purchased: false,
      is_scheduled: false,
      is_expired: false,
      post_type: 1, // プランの場合は仮で動画(1)を設定
      description: plan.description || '',
      thumbnail_key: profile?.avatar_url || '', // アバター画像を設定
      creator: {
        user_id: profile?.id || '',
        username: profile?.username || '',
        profile_name: profile?.profile_name || '',
        avatar: profile?.avatar_url || '',
        official: profile?.offical_flg || false,
      },
      categories: [],
      media_info: [],
      sale_info: {
        price: null, // プラン購入時は単品購入を表示しない
        plans: [
          {
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            price: plan.price,
            type: plan.type,
            open_dm_flg: plan.open_dm_flg,
            post_count: plan.post_count,
            plan_post: plan.plan_post, // プランに紐づく投稿を渡す
          },
        ],
      },
      post_main_duration: 0,
    };
  };

  const pageTitle = `${profile.profile_name} (@${profile.username}) | mijfans`;
  const pageDescription = profile.bio || `${profile.profile_name}のプロフィールページ`;

  return (
    <>
      <OgpMeta
        title={pageTitle}
        description={pageDescription}
        url={`https://stg.mijfans.jp/account/profile?username=${profile.username}`}
        imageUrl={ogpImageUrl}
        type="profile"
        twitterCard="summary_large_image"
      />

      <AccountLayout>
        <div className="space-y-0">
          {/* Profile Header Section */}
          <ProfileHeaderSection
            coverUrl={profile.cover_url}
            avatarUrl={profile.avatar_url}
            username={profile.username || ''}
          />

          {/* Profile Info Section */}
          <ProfileInfoSection
            userId={profile.id}
            profile_name={profile.profile_name}
            username={profile.username || ''}
            bio={profile.bio}
            postCount={profile.post_count}
            followerCount={profile.follower_count}
            websiteUrl={profile.website_url}
            isOwnProfile={isOwnProfile}
            officalFlg={profile?.offical_flg || false}
            links={profile.links}
            onAuthRequired={() => setShowAuthDialog(true)}
            avatarUrl={profile.avatar_url}
            isCreator={profile.plans && profile.plans.length > 0}
          />

          {/* Top Buyer Section */}
          {profile.top_buyers && profile.top_buyers.length > 0 && (
            <TopBuyerSection
              topBuyers={profile.top_buyers}
              profile_name={profile.profile_name}
            />
          )}

          {/* Horizontal Plan List */}
          {profile.plans && profile.plans.length > 0 && (
            <HorizontalPlanList
              plans={profile.plans}
              onPlanClick={handlePlanJoin}
              isOwnProfile={isOwnProfile}
              onAuthRequired={() => setShowAuthDialog(true)}
            />
          )}

          {/* Navigation */}
          <AccountNavigation items={navigationItems} onItemClick={handleTabClick} />

          {/* Content Section */}
          <ContentSection
            activeTab={activeTab}
            posts={profile.posts.map((post) => ({
              id: post.id,
              post_type: post.post_type,
              likes_count: post.likes_count,
              description: post.description || '',
              thumbnail_url: post.thumbnail_url,
              video_duration: post.video_duration,
              price: post.price,
              currency: post.currency,
              created_at: post.created_at,
              is_reserved: post.is_reserved,
            }))}
            plans={profile.plans.map((plan) => ({
              id: plan.id,
              name: plan.name,
              description: plan.description,
              price: plan.price,
              currency: plan.currency,
              type: plan.type,
              post_count: plan.post_count,
              plan_post: plan.plan_post,
            }))}
            // TODO: 決済の時、再修正
            individualPurchases={profile.individual_purchases.map((purchase) => ({
              id: purchase.id,
              likes_count: purchase.likes_count || 0,
              description: purchase.description || '',
              thumbnail_url: purchase.thumbnail_url || '',
              video_duration: purchase.video_duration,
              created_at: purchase.created_at,
              price: purchase.price,
              currency: purchase.currency,
              is_reserved: purchase.is_reserved,
            }))}
            likedPosts={likedPosts}
            bookmarkedPosts={bookmarkedPosts}
            likesLoading={likesLoading}
            bookmarksLoading={bookmarksLoading}
            onPlanJoin={handlePlanJoin}
            isOwnProfile={isOwnProfile}
            onAuthRequired={() => setShowAuthDialog(true)}
          />
        </div>

        {/* 支払い方法選択ダイアログ */}
        {selectedPlan && (
          <SelectPaymentDialog
            isOpen={dialogs.payment}
            onClose={() => closeDialog('payment')}
            post={convertPlanToPostData(selectedPlan)}
            onPayment={handlePayment}
          />
        )}


        <BottomNavigation />

        {/* AuthDialog */}
        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
      </AccountLayout>
    </>
  );
}

