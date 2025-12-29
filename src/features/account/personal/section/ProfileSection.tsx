import React from 'react';
import { Pencil, ChevronRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '@/features/account/personal/types';
import { useAuth } from '@/providers/AuthContext';
import OfficalBadge from '@/components/common/OfficalBadge';

interface ProfileSectionProps {
  profile: UserProfile;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-gray-200 p-4">
      {/* 上部: 名前・ユーザー名・アバター */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl text-gray-900">{profile.name}</h2>
            {profile?.offical_flg && <OfficalBadge />}
          </div>
          <p className="text-base text-gray-500">
            {profile.username.startsWith('@') ? profile.username : `@${profile.username}`}
          </p>

          {/* プロフィールを見るボタンと編集アイコン */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => navigate(`/profile?username=${profile.username}`)}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary border border-primary rounded-full transition-colors hover:bg-primary/90"
            >
              プロフィールを見る
            </button>
            <button
              onClick={() => navigate('/account/edit')}
              className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="プロフィール編集"
            >
              <Pencil className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
        />
      </div>

      {/* 統計情報 */}
      <div className="flex items-center justify-around mb-4 py-3 border-t border-b border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">フォロー</p>
          <p
            className="text-base font-bold text-gray-900 cursor-pointer"
            onClick={() => navigate(`/follow/list/${profile.username}?tab=following`)}
          >
            {profile.followingCount}
            <span className="text-xs font-normal text-gray-600">人</span>
          </p>
        </div>
        <div className="w-px h-10 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">フォロワー</p>
          <p
            className="text-base font-bold text-gray-900 cursor-pointer"
            onClick={() => navigate(`/follow/list/${profile.username}?tab=followers`)}
          >
            {profile.followerCount}
            <span className="text-xs font-normal text-gray-600">人</span>
          </p>
        </div>
        <div className="w-px h-10 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">累計いいね</p>
          <p className="text-base font-bold text-gray-900">
            {profile.totalLikes}
            <span className="text-xs font-normal text-gray-600">いいね</span>
          </p>
        </div>
      </div>
    </div>
  );
}
