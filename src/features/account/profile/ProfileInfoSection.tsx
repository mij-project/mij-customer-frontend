import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon } from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import FollowButton from '@/components/social/FollowButton';
import OfficalBadge from '@/components/common/OfficalBadge';
import { SocialLinks } from '@/api/types/profile';
import ChipButton from '@/components/social/ChipButton';
import MessageButton from '@/components/social/MessageButton';
import ChipPaymentDialog from '@/components/common/ChipPaymentDialog';
import { getOrCreateConversation } from '@/api/endpoints/conversation';
import { useAuth } from '@/providers/AuthContext';

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
  isCreator: boolean;
  links?: SocialLinks;
  onAuthRequired?: () => void;
  avatarUrl?: string;
  has_sent_chip?: boolean;
  has_dm_release_plan?: boolean;
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
  isCreator,
  links,
  onAuthRequired,
  avatarUrl,
  has_sent_chip = false,
  has_dm_release_plan = false,
}: ProfileInfoSectionProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isChipDialogOpen, setIsChipDialogOpen] = useState(false);
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

  const moveConversation = async (userId: string) => {
    try {
      setIsLoadingConversation(true);

      // 会話を取得または作成
      const response = await getOrCreateConversation(userId);

      // 会話画面に遷移（プロフィール画面から来たことを示すstateを渡す）
      navigate(`/message/conversation/${response.data.conversation_id}`, {
        state: { fromProfile: true, profileUsername: username },
      });
    } catch (error: any) {
      console.error('会話の作成/取得に失敗しました:', error);

      // エラーメッセージを表示（必要に応じて）
      if (error.response?.status === 400) {
        alert('自分自身とのメッセージはできません');
      } else if (error.response?.status === 401) {
        // 未認証の場合は認証ダイアログを表示
        onAuthRequired?.();
      } else {
        alert('会話の作成に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsLoadingConversation(false);
    }
  };

  return (
    <div className="px-4 pt-14 pb-4">
      <div className="mb-3">
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            {profile_name}
            {officalFlg && <OfficalBadge />}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600">
              {username.startsWith('@') ? username : `@${username}`}
            </p>
            {/* SNS Icons - usernameの右側 */}
            {links && (
              <div className="flex items-center gap-3">
                {links.youtube_link && (
                  <a
                    href={links.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-red-600 transition-colors"
                    title="YouTube"
                  >
                    <FaYoutube className="h-5 w-5" />
                  </a>
                )}
                {links.instagram_link && (
                  <a
                    href={links.instagram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-pink-600 transition-colors"
                    title="Instagram"
                  >
                    <FaInstagram className="h-5 w-5" />
                  </a>
                )}
                {links.twitter_link && (
                  <a
                    href={links.twitter_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-400 transition-colors"
                    title="Twitter / X"
                  >
                    <FaXTwitter className="h-5 w-5" />
                  </a>
                )}
                {links.tiktok_link && (
                  <a
                    href={links.tiktok_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-black transition-colors"
                    title="TikTok"
                  >
                    <FaTiktok className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm mb-3">
        <span className="text-gray-900">
          <span className="font-bold">{postCount}</span> <span className="text-gray-600">投稿</span>
        </span>
        <span className="text-gray-900">
          <span className="font-bold">{followerCount.toLocaleString()}</span>{' '}
          <span className="text-gray-600">フォロワー</span>
        </span>
      </div>

      {/* ボタン - usernameの下 */}
      {!isOwnProfile && (
        <div className={`grid gap-2 mb-3 ${isCreator ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {isCreator && (
            <ChipButton onClick={() => setIsChipDialogOpen(true)} onAuthRequired={onAuthRequired} />
          )}
          <FollowButton userId={userId} onAuthRequired={onAuthRequired} />
          <MessageButton
            onClick={() => {
              moveConversation(userId);
            }}
            onAuthRequired={onAuthRequired}
          />
        </div>
      )}

      {/* Website Links */}
      {links && (
        <div className="mb-3">
          <div className="flex flex-col gap-1">
            {links.website && (
              <a
                href={links.website.startsWith('http') ? links.website : `https://${links.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary text-sm hover:underline"
              >
                <LinkIcon className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">{links.website}</span>
              </a>
            )}
            {links.website2 && (
              <a
                href={
                  links.website2.startsWith('http') ? links.website2 : `https://${links.website2}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary text-sm hover:underline"
              >
                <LinkIcon className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">{links.website2}</span>
              </a>
            )}
          </div>
        </div>
      )}

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

      {/* チップ決済ダイアログ */}
      <ChipPaymentDialog
        isOpen={isChipDialogOpen}
        onClose={() => setIsChipDialogOpen(false)}
        recipientUserId={userId}
        recipientName={profile_name}
        recipientAvatar={avatarUrl}
        has_sent_chip={has_sent_chip}
        has_dm_release_plan={has_dm_release_plan}
      />
    </div>
  );
}
