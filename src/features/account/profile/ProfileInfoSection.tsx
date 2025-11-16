import React, { useEffect, useRef, useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FollowButton from '@/components/social/FollowButton';
import OfficalBadge from '@/components/common/OfficalBadge';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const bioRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    // Reset and measure overflow when bio changes
    setIsExpanded(false);
    // Wait for DOM paint to measure heights correctly
    requestAnimationFrame(() => {
      if (bioRef.current) {
        const el = bioRef.current;
        // Temporarily enforce clamp to measure overflow against max height (~4 lines)
        const lineHeightRem = 1.25; // Tailwind text-sm line-height ~1.25rem
        const clampPx = lineHeightRem * 16 * 4; // 4 lines
        const prevMaxHeight = el.style.maxHeight;
        const prevOverflow = el.style.overflow;
        el.style.maxHeight = `${clampPx}px`;
        el.style.overflow = 'hidden';
        // Measure overflow
        const truncated = el.scrollHeight > el.clientHeight + 1; // tolerance
        setIsTruncated(truncated);
        // Restore styles; actual rendering will set via isExpanded
        el.style.maxHeight = prevMaxHeight;
        el.style.overflow = prevOverflow;
      } else {
        setIsTruncated(false);
      }
    });
  }, [bio]);

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            {profile_name}
            {officalFlg && <OfficalBadge />}
          </h1>
          <p className="text-sm text-gray-600">@{username}</p>
        </div>
        {!isOwnProfile && (
          <div className="flex items-center space-x-2 -mt-10">
            <FollowButton userId={userId} />
          </div>
        )}
      </div>

      {bio && (
        <>
          <p
            ref={bioRef}
            className="text-sm text-gray-700 mb-2 whitespace-pre-wrap"
            style={
              isExpanded
                ? { maxHeight: 'none' }
                : { maxHeight: `${1.25 * 16 * 4}px`, overflow: 'hidden' } // ~4 lines at text-sm (1.25rem line-height)
            }
          >
            {bio}
          </p>
          {isTruncated && (
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="text-sm text-primary hover:underline"
            >
              {isExpanded ? '閉じる' : 'もっと見る'}
            </button>
          )}
        </>
      )}

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
