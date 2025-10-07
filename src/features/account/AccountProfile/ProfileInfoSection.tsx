import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FollowButton from '@/components/social/FollowButton';
interface ProfileInfoSectionProps {
  userId: string;
  profile_name: string;
  username: string;
  bio?: string;
  postCount: number;
  followerCount: number;
  websiteUrl?: string;
}

export default function ProfileInfoSection({
  userId,
  profile_name,
  username,
  bio,
  postCount,
  followerCount,
  websiteUrl
}: ProfileInfoSectionProps) {
  return (
    <div className="px-6 pt-10 pb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{profile_name}</h1>
          <p className="text-gray-600">@{username}</p>
          {bio && <p className="text-gray-700 mt-2">{bio}</p>}
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span>{postCount}投稿</span>
            <span>{followerCount}フォロワー</span>
          </div>
          {websiteUrl && (
            <a href={websiteUrl} className="flex items-center space-x-1 text-primary text-sm mt-2">
              <LinkIcon className="h-4 w-4" />
              <span>{websiteUrl}</span>
            </a>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <FollowButton userId={userId} />
        </div>
      </div>
    </div>
  );
} 