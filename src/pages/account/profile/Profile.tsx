import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import OgpMeta from '@/components/common/OgpMeta';
import SEOHead from '@/components/seo/SEOHead';
import AccountLayout from '@/features/account/components/AccountLayout';
import AccountNavigation from '@/features/account/components/AccountNavigation';
import { getUserProfileByUsername, getUserOgpImage } from '@/api/endpoints/user';
import { UserProfile } from '@/api/types/profile';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useAuth } from '@/providers/AuthContext';
import { getLikedPosts, getBookmarkedPosts } from '@/api/endpoints/account';

// セクションコンポーネントをインポート
import ProfileHeaderSection from '@/features/account/profile/ProfileHeaderSection';
import ProfileInfoSection from '@/features/account/profile/ProfileInfoSection';
import HorizontalPlanList from '@/features/account/profile/HorizontalPlanList';
import ContentSection from '@/features/account/profile/ContentSection';
import SelectPaymentDialog from '@/components/common/SelectPaymentDialog';
import CreditPaymentDialog from '@/components/common/CreditPaymentDialog';
import { createPurchase } from '@/api/endpoints/purchases';
import { PostDetailData } from '@/api/types/post';
import { ProfilePlan } from '@/api/types/profile';
import AuthDialog from '@/components/auth/AuthDialog';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'posts' | 'plans' | 'individual' | 'gacha' | 'videos' | 'images' | 'likes' | 'bookmarks'
  >('posts');
  const [ogpImageUrl, setOgpImageUrl] = useState<string | null>(null);

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
  const [purchaseType] = useState<'subscription'>('subscription');
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const username = searchParams.get('username');

  useEffect(() => {
    if (!username) {
      setError('ユーザー名が指定されていません');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
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

    fetchProfile();
  }, [username, user?.id]);

  if (loading) return <div className="p-6 text-center">読み込み中...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!profile) return <div className="p-6 text-center">プロフィールが見つかりません</div>;

  // 自分のプロフィールかどうかを判定
  const isOwnProfile = user?.id === profile.id;

  // 動画・画像の件数を計算
  const videosCount = profile.posts.filter((post) => post.post_type === 1).length;
  const imagesCount = profile.posts.filter((post) => post.post_type === 2).length;

  const navigationItems = [
    { id: 'posts', label: '投稿', count: profile.posts.length, isActive: activeTab === 'posts' },
    { id: 'videos', label: '動画', count: videosCount, isActive: activeTab === 'videos' },
    { id: 'images', label: '画像', count: imagesCount, isActive: activeTab === 'images' },
    { id: 'plans', label: 'プラン', count: profile.plans.length, isActive: activeTab === 'plans' },
    {
      id: 'individual',
      label: '単品販売',
      count: profile.individual_purchases.length,
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
  const handlePlanJoin = (plan: ProfilePlan) => {
    setSelectedPlan(plan);
    setDialogs((prev) => ({ ...prev, payment: true }));
  };

  // 支払い方法選択後のハンドラー
  const handlePaymentMethodSelect = (method: string) => {
    if (method === 'credit_card') {
      setDialogs((prev) => ({ ...prev, payment: false, creditPayment: true }));
    } else {
      setDialogs((prev) => ({ ...prev, payment: false }));
    }
  };

  // 共通のダイアログクローズ関数
  const closeDialog = (dialogName: keyof typeof dialogs) => {
    setDialogs((prev) => ({ ...prev, [dialogName]: false }));
  };

  // 決済実行ハンドラー
  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      const res = await createPurchase({
        item_type: 'subscription',
        plan_id: selectedPlan.id,
      });

      if (res) {
        setTimeout(() => {
          closeDialog('creditPayment');
          closeDialog('payment');
          alert('プランへの加入が完了しました！');
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error('決済エラー:', error);
      alert('決済に失敗しました。もう一度お試しください。');
    }
  };

  // PostDetailData形式に変換（SelectPaymentDialog用）
  const convertPlanToPostData = (plan: ProfilePlan): PostDetailData | undefined => {
    if (!plan) return undefined;

    return {
      id: plan.id,
      post_type: 1, // プランの場合は仮で動画(1)を設定
      description: plan.description || '',
      thumbnail_key: plan.thumbnails?.[0] || '',
      creator: {
        user_id: profile?.id || '',
        username: profile?.username || '',
        profile_name: profile?.profile_name || '',
        avatar: profile?.avatar_url || '',
      },
      categories: [],
      media_info: [],
      sale_info: {
        price: plan.price,
        plans: [
          {
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            price: plan.price,
          },
        ],
      },
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
          />

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
            }))}
            plans={profile.plans.map((plan) => ({
              id: plan.id,
              name: plan.name,
              description: plan.description,
              price: plan.price,
              currency: plan.currency,
              type: plan.type,
              post_count: plan.post_count,
              thumbnails: plan.thumbnails,
            }))}
            individualPurchases={profile.individual_purchases.map((purchase) => ({
              id: purchase.id,
              likes_count: purchase.likes_count || 0,
              description: purchase.description || '',
              thumbnail_url: purchase.thumbnail_url || '',
              video_duration: purchase.video_duration,
              created_at: purchase.created_at,
              price: purchase.price,
              currency: purchase.currency,
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

        <BottomNavigation         />

        {/* AuthDialog */}
        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
      </AccountLayout>
    </>
  );
}
