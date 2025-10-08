import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AccountLayout from '@/features/account/component/AccountLayout';
import AccountNavigation from '@/features/account/component/AccountNavigation';
import { getUserProfileByUsername } from '@/api/endpoints/user';
import { UserProfile } from '@/api/types/profile';
import BottomNavigation from '@/components/common/BottomNavigation';

// セクションコンポーネントをインポート
import ProfileHeaderSection from '@/features/account/AccountProfile/ProfileHeaderSection';
import ProfileInfoSection from '@/features/account/AccountProfile/ProfileInfoSection';
import ContentSection from '@/features/account/AccountProfile/ContentSection';
import { log } from 'console';

const NO_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEwMCAxMDBaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTRBRiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

export default function AccountProfile() {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'plans' | 'individual' | 'gacha'>('posts');
  
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
      } catch (err) {
        setError('プロフィールの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) return <div className="p-6 text-center">読み込み中...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!profile) return <div className="p-6 text-center">プロフィールが見つかりません</div>;

  const navigationItems = [
    { id: 'posts', label: '投稿', count: profile.posts.length, isActive: activeTab === 'posts' },
    { id: 'plans', label: 'プラン', count: profile.plans.length, isActive: activeTab === 'plans' },
    { id: 'individual', label: '単品購入', count: profile.individual_purchases.length, isActive: activeTab === 'individual' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as 'posts' | 'plans' | 'individual' | 'gacha');
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Profile Header Section */}
        <ProfileHeaderSection
          coverUrl={profile.cover_url}
          avatarUrl={profile.avatar_url}
          username={profile.username}
        />

        {/* Profile Info Section */}
        <ProfileInfoSection 
          userId={profile.id}
          profile_name={profile.profile_name}
          username={profile.username}
          bio={profile.bio}
          postCount={profile.post_count}
          followerCount={profile.follower_count}
          websiteUrl={profile.website_url}
        />

        {/* Navigation */}
        <AccountNavigation items={navigationItems} onItemClick={handleTabClick} />

        {/* Content Section */}
        <ContentSection 
          activeTab={activeTab}
          posts={profile.posts.map(post => ({
            id: post.id,
            likes_count: post.likes_count,
            description: post.description || '',
            thumbnail_url: post.thumbnail_url,
            created_at: post.created_at
          }))}
          plans={profile.plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency
          }))}
          individualPurchases={profile.individual_purchases.map(purchase => ({
            id: purchase.id,
            likes_count: purchase.likes_count || 0,
            description: purchase.description || '',
            thumbnail_url: purchase.thumbnail_url || '',
            created_at: purchase.created_at
          }))}
          gachaItems={profile.gacha_items.map(gacha => ({
            id: gacha.id,
            amount: gacha.amount,
            created_at: gacha.created_at
          }))}
        />
      </div>
      <BottomNavigation />
    </AccountLayout>
  );
}
