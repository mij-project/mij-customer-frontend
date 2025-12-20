import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getAccountInfo } from '@/api/endpoints/account';
import AuthDialog from '@/components/auth/AuthDialog';

// セクションコンポーネントをインポート
import ProfileSection from '@/features/account/personal/section/ProfileSection';
import AccountSettingsSection from '@/features/account/setting/AccountSettingsSection';
import AccountNavigation from '@/features/account/components/AccountNavigation';
import PostManagementSection from '@/features/account/post/PostManagementSection';
import SalesSection from '@/features/account/sale/SalesSection';
import PlanManagementSection from '@/features/account/setting/PlanManagementSection';
import JoinedPlansSection from '@/features/account/social/JoinedPlansSection';
import IndividualPurchasesSection from '@/features/account/social/IndividualPurchasesSection';
import LikedPostsSection from '@/features/account/social/LikedPostsSection';
import { useAuth } from '@/providers/AuthContext';
import { UserRole } from '@/utils/userRole';

// 型定義をインポート
import { AccountInfo as ApiAccountInfo } from '@/features/account/types';
import { UserProfile } from '@/features/account/personal/types';
import MessageAsettsSection from '@/features/account/setting/MessageAsettsSection';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admin' | 'joined' | 'individual' | 'likes'>('admin');
  const [accountInfo, setAccountInfo] = useState<ApiAccountInfo | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { user, loading: authLoading } = useAuth();

  const baseNavigationItems = [
    {
      id: 'joined',
      label: '加入中',
      isActive: activeTab === 'joined',
    },
    {
      id: 'individual',
      label: '購入済み',
      isActive: activeTab === 'individual',
    },
    {
      id: 'likes',
      label: 'いいね',
      isActive: activeTab === 'likes',
    },
  ];

  // クリエイターの場合は管理画面のナビゲーションを追加
  const navigationItems =
    user?.role === UserRole.CREATOR
      ? [
          { id: 'admin', label: '管理画面', count: undefined, isActive: activeTab === 'admin' },
          ...baseNavigationItems,
        ]
      : baseNavigationItems;

  const profile_info: UserProfile = {
    offical_flg: user?.offical_flg || false,
    name: accountInfo?.profile_info?.profile_name || '',
    username: accountInfo?.profile_info?.username || '',
    avatar: accountInfo?.profile_info?.avatar_url || '/assets/no-image.svg',
    followingCount: accountInfo?.social_info?.following_count || 0,
    followerCount: accountInfo?.social_info?.followers_count || 0,
    totalLikes: accountInfo?.social_info?.total_likes || 0,
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as 'admin' | 'joined' | 'individual' | 'likes');
  };

  useEffect(() => {
    const fetchAccountInfo = async () => {
      // AuthProviderの認証状態取得中は待機
      if (authLoading) {
        return;
      }

      // ユーザーがログインしていない場合はAuthDialogを表示
      if (!user) {
        setLoading(false);
        setShowAuthDialog(true);
        return;
      }

      try {
        const data = await getAccountInfo();
        setAccountInfo(data);
      } catch (error) {
        console.error('Failed to fetch account info:', error);
        // API呼び出しに失敗した場合もAuthDialogを表示
        setShowAuthDialog(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="max-w-md mx-auto pt-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">アカウント情報を読み込み中...</p>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="max-w-md mx-auto pt-16 pb-4">
        {/* Profile Section */}
        <ProfileSection profile={profile_info} />

        {/* Account Settings Link */}
        <AccountSettingsSection />

        {/* Tab Navigation */}
        {/* Navigation */}
        <AccountNavigation items={navigationItems} onItemClick={handleTabClick} />

        {/* Management Content */}
        {activeTab === 'admin' && user?.role === UserRole.CREATOR && (
          <div className="px-6 space-y-4 mb-40 pt-4">
            {/* Post Management */}
            <PostManagementSection accountInfo={accountInfo} />

            {/* Sales */}
            <SalesSection accountInfo={accountInfo} />

            {/* Plan Management */}
            <PlanManagementSection accountInfo={accountInfo} />

            {/* Message Asetts */}
            <MessageAsettsSection />
          </div>
        )}

        {/* Other tabs content */}
        {activeTab === 'joined' && <JoinedPlansSection accountInfo={accountInfo} />}

        {activeTab === 'individual' && <IndividualPurchasesSection accountInfo={accountInfo} />}

        {activeTab === 'likes' && <LikedPostsSection accountInfo={accountInfo} />}
      </div>
      <BottomNavigation />

      {/* Auth Dialog */}
      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
    </div>
  );
}
