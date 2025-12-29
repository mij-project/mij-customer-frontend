import { Crown, User, Check, Plus, Diamond } from 'lucide-react';
import { Button } from '../ui/button';
import { Creator } from '@/features/top/types';
import { useAuth } from '@/providers/AuthContext';
import { useEffect, useState } from 'react';
import OfficalBadge from './OfficalBadge';

interface CreatorCardProps {
  creator: Creator;
  showRank?: boolean;
  showFollowButton?: boolean;
  onCreatorClick: (username: string) => void;
  onFollowClick: (isFollowing: boolean, creatorId: string) => void;
}

export default function CreatorCard({
  creator,
  showRank = true,
  showFollowButton = true,
  onCreatorClick,
  onFollowClick,
}: CreatorCardProps) {
  const [isSelf, setIsSelf] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    if (!user) {
      setIsSelf(false);
    } else {
      setIsSelf(user.id === creator.id);
    }
  }, [user]);

  const getRankColor = (rank?: number) => {
    if (!rank) return { text: 'text-primary', fill: 'fill-primary' };
    if (rank === 1)
      return {
        text: 'text-[#f9e16b] drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]',
        fill: 'fill-[#f9e16b]',
      }; // 光沢感のある金
    if (rank === 2)
      return {
        text: 'text-[#d4d8e3] drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]',
        fill: 'fill-[#d4d8e3]',
      }; // 光沢感のある銀
    if (rank === 3)
      return {
        text: 'text-[#d49a6a] drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]',
        fill: 'fill-[#d49a6a]',
      }; // 光沢感のある銅
    return { text: 'text-primary', fill: 'fill-primary' };
  };

  return (
    <div className="flex items-center gap-1 border-black/20 border-b-[0.5px]">
      <div
        className="flex flex-1 items-center justify-between gap-2 py-3 text-black hover:text-black cursor-pointer"
        onClick={() => onCreatorClick(creator.username)}
      >
        <div className="flex items-center gap-2">
          {showRank &&
            (() => {
              if (creator.rank <= 6) {
                const rankColor = getRankColor(creator.rank);
                return (
                  <div className="relative flex items-center justify-center">
                    <Crown className={`h-7 w-7 ${rankColor.text} ${rankColor.fill}`} />
                    <span className="absolute text-[12px] font-bold text-white leading-none">
                      {creator.rank}
                    </span>
                  </div>
                );
              } else {
                return (
                  <div className="relative flex items-center justify-center">
                    <Diamond className="h-7 w-7 text-gray-200" />
                    <span className="absolute text-[12px] font-bold text-gray-500 leading-none">
                      {creator.rank}
                    </span>
                  </div>
                );
              }
            })()}
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={creator.avatar || '/assets/no-image.svg'}
            alt={creator.name}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-900">{creator.name}</span>
            {creator.official && (
              <span className="ml-1">
                <OfficalBadge />
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">@{creator.username}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400">{creator.likes?.toLocaleString() || 0}いいね</p>
            <p className="text-xs text-gray-400">|</p>
            <p className="text-xs text-gray-400">
              {creator.followers?.toLocaleString() || 0} フォロワー
            </p>
          </div>
        </div>
      </div>
      {!isSelf && (
        <button
          onClick={() => {
            onFollowClick(creator.is_following, creator.id);
          }}
          disabled={showFollowButton}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            creator.is_following
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-white border-2 border-primary text-primary hover:bg-primary/5'
          }`}
        >
          {creator.is_following ? (
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
      )}
    </div>
  );
}
