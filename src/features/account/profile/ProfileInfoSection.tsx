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
  isOwnProfile: boolean;
  officalFlg: boolean;
}

export default function ProfileInfoSection({
  userId,
  profile_name,
  username,
  bio,
  postCount,
  followerCount,
  websiteUrl,
  isOwnProfile,
  officalFlg,
}: ProfileInfoSectionProps) {
  return (
    <div className="px-4 pt-14 pb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            {profile_name}
            {officalFlg && (
              <span className="inline-flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-label="verified badge" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#6ccaf1"/>
                  <path d="M9 12.5l2.2 2.2L16.5 9.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-600">@{username}</p>
        </div>
        {!isOwnProfile && (
          <div className="flex items-center space-x-2 -mt-10">
            <FollowButton userId={userId} />
          </div>
        )}
      </div>

      {bio && <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{bio}</p>}

      {websiteUrl && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-primary text-sm mb-3 hover:underline"
        >
          <LinkIcon className="h-4 w-4" />
          <span className="break-all">{websiteUrl}</span>
        </a>
      )}

      <div className="flex items-center space-x-4 text-sm">
        <span className="text-gray-900">
          <span className="font-bold">{postCount}</span> <span className="text-gray-600">投稿</span>
        </span>
        <span className="text-gray-900">
          <span className="font-bold">{followerCount.toLocaleString()}</span>{' '}
          <span className="text-gray-600">フォロワー</span>
        </span>
      </div>
    </div>
  );
}
