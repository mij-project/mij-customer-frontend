import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { ChevronLeft, UserPlus, UserCheck, Check, Plus, User } from 'lucide-react';
import { getFollowers, getFollowing, toggleFollow, getFollowStatus } from '@/api/endpoints/social';
import { getUserProfileByUsername } from '@/api/endpoints/user';
import { UserBasicResponse } from '@/api/types/social';
import BottomNavigation from '@/components/common/BottomNavigation';

const CDN_BASE_URL = import.meta.env.VITE_CDN_BASE_URL || '';
const NO_AVATAR_URL = '/assets/default-avatar.png';

type TabType = 'followers' | 'following';

export default function FollowList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { username: usernameParam } = useParams<{ username: string }>();
  const username = usernameParam || searchParams.get('username') || '';
  const initialTab = searchParams.get('tab') as TabType || 'followers';

  const [userId, setUserId] = useState<string>('');
	const [profileName, setProfileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [followers, setFollowers] = useState<UserBasicResponse[]>([]);
  const [following, setFollowing] = useState<UserBasicResponse[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [togglingFollow, setTogglingFollow] = useState<Record<string, boolean>>({});

  // usernameからuserIdを取得
  useEffect(() => {
    const fetchUserId = async () => {
      if (!username) return;

      try {
        const profile = await getUserProfileByUsername(username);
				setProfileName(profile.profile_name);
        setUserId(profile.id);
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
      }
    };

    fetchUserId();
  }, [username]);

  // userIdが取得できたらフォロー情報を取得
  useEffect(() => {
    if (userId) {
      fetchFollowData();
    }
  }, [userId]);

  useEffect(() => {
    // アクティブタブのユーザーのフォロー状態を取得
    const users = activeTab === 'followers' ? followers : following;
    users.forEach((user) => {
      fetchFollowStatus(user.id);
    });
  }, [activeTab, followers, following]);

  const fetchFollowData = async () => {
    setLoading(true);
    try {
      const [followersRes, followingRes] = await Promise.all([
        getFollowers(userId, 0, 100),
        getFollowing(userId, 0, 100),
      ]);

      setFollowers(followersRes.data || []);
      setFollowing(followingRes.data || []);
      setFollowersCount(followersRes.data?.length || 0);
      setFollowingCount(followingRes.data?.length || 0);
    } catch (error) {
      console.error('フォロー情報の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStatus = async (targetUserId: string) => {
    try {
      const response = await getFollowStatus(targetUserId);
      setFollowStates((prev) => ({ ...prev, [targetUserId]: response.data.following }));
    } catch (error) {
      console.error('フォロー状態の取得に失敗しました:', error);
    }
  };

  const handleToggleFollow = async (targetUserId: string) => {
    if (togglingFollow[targetUserId]) return;

    setTogglingFollow((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const response = await toggleFollow(targetUserId);
      setFollowStates((prev) => ({ ...prev, [targetUserId]: response.data.following || false }));
    } catch (error) {
      console.error('フォロー操作に失敗しました:', error);
    } finally {
      setTogglingFollow((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleUserClick = (targetUsername: string) => {
    navigate(`/profile?username=${targetUsername}`);
  };

  const currentList = activeTab === 'followers' ? followers : following;

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">{profileName}のフォローリスト</h1>
          <div className="w-10"></div>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'followers'
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('followers')}
          >
            フォロワー {followersCount}
            {activeTab === 'followers' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'following'
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('following')}
          >
            フォロー中 {followingCount}
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* ユーザーリスト */}
      <div className="pb-20">
        {loading ? (
          <div className="p-6 text-center text-gray-500">読み込み中...</div>
        ) : currentList.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {activeTab === 'followers' ? 'フォロワーがいません' : 'フォロー中のユーザーがいません'}
          </div>
        ) : (
          <div className="bg-white">
            {currentList.map((user) => {
              const avatarUrl = user.avatar_storage_key
                ? `${user.avatar_storage_key}`
                : NO_AVATAR_URL;
              const isFollowing = followStates[user.id] || false;
              const isToggling = togglingFollow[user.id] || false;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="flex items-center flex-1 cursor-pointer"
                    onClick={() => handleUserClick(user.username)}
                  >
                    <img
                      src={avatarUrl}
                      alt={user.profile_name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = NO_AVATAR_URL;
                      }}
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{user.profile_name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>

                  {/* フォローボタン */}
                  <button
                    onClick={() => handleToggleFollow(user.id)}
                    disabled={isToggling}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isFollowing
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-white border-2 border-primary text-primary hover:bg-primary/5'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="h-4 w-4" />
                        <User className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <User className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
