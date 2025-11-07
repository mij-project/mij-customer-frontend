import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '@/features/account/Account/types';

interface ProfileSectionProps {
  profile: UserProfile;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 py-6">
      <div className="flex items-center space-x-4">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
          <p className="text-gray-600">@{profile.username}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>{profile.followingCount}フォロー中</span>
            <span>{profile.followerCount}フォロワー</span>
            <span>{profile.totalLikes}いいね</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/account/edit')}>
            <Edit className="h-4 w-4 mr-2" />
            編集
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/account/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            設定
          </Button>
        </div>
      </div>
    </div>
  );
}
