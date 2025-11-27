import { Check, Crown, Heart, Plus, User, UserCheck, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Creator } from '@/features/top/types';
import { useAuth } from '@/providers/AuthContext';
import { useEffect, useState } from 'react';

interface SpecialCreatorCardProps {
  creator: Creator;
  showRank?: boolean;
  showFollowButton?: boolean;
  onCreatorClick: (username: string) => void;
  onFollowClick: (isFollowing: boolean, creatorId: string) => void;
}

export default function SpecialCreatorCard({
  creator,
  showRank = true,
  showFollowButton = true,
  onCreatorClick,
  onFollowClick,
}: SpecialCreatorCardProps) {
  const { user } = useAuth();
  const [isSelf, setIsSelf] = useState(false);

  useEffect(() => {
    if (!user) return setIsSelf(false);
    setIsSelf(user.id === creator.id);
  }, [user]);

  const getRankColor = (rank?: number) => {
    if (!rank) return { text: 'text-primary', fill: 'fill-primary' };
    if (rank === 1) return { text: 'text-yellow-500', fill: 'fill-yellow-500' }; // 金色
    if (rank === 2) return { text: 'text-gray-400', fill: 'fill-gray-400' }; // 銀色
    if (rank === 3) return { text: 'text-orange-600', fill: 'fill-orange-600' }; // 銅色
    return { text: 'text-primary', fill: 'fill-primary' };
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-sm border border-black/5 overflow-hidden">
      {/* cover */}
      <div className="relative w-full h-48 md:h-64">
        <img
          src={creator.cover || '/assets/default-cover.jpg'}
          alt={creator.name}
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={() => onCreatorClick(creator.username)}
          className="absolute left-1/2 -bottom-12 -translate-x-1/2"
        >
          <div className="relative">
            <img
              src={creator.avatar || '/assets/no-image.svg'}
              alt={creator.name}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
              <span className="text-white text-lg">✓</span>
            </div>
          </div>
        </button>
      </div>

      {/* info */}
      <div className="pt-16 pb-6 px-4 md:px-8 text-center">
        <button type="button" onClick={() => onCreatorClick(creator.username)} className="w-full">
          <div className="flex items-center justify-center gap-2">
            {showRank &&
              creator.rank &&
              (() => {
                const rankColor = getRankColor(creator.rank);
                return (
                  <div className="relative flex items-center justify-center">
                    <Crown className={`h-10 w-10 ${rankColor.text} ${rankColor.fill}`} />
                    <span className="absolute text-[12px] font-bold text-white leading-none">
                      {creator.rank}
                    </span>
                  </div>
                );
              })()}
            <p className="text-lg md:text-xl font-semibold text-gray-900">{creator.name}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{creator.username}</p>
        </button>

        <div className="mt-3 flex items-center justify-center gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-400">{creator.likes?.toLocaleString()} いいね</span>
          </div>
          <span className="text-gray-400">|</span>
          <span className="text-gray-400">{creator.followers?.toLocaleString()} フォロワー</span>
        </div>

        {!isSelf && (
          <div className="flex items-center justify-center gap-2 mt-4">
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
                  <Check className="h-5 w-5" />
                  <User className="h-5 w-5" />
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <User className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
