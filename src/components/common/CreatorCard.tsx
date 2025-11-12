import { Crown, UserCheck, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Creator } from '@/features/top/types';
import { useAuth } from '@/providers/AuthContext';
import { useEffect, useState } from 'react';

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

  return (
    <div className="flex items-center gap-1 border-black/20 border-b-[0.5px]">
      <div
        className="flex flex-1 items-center justify-between gap-2 py-3 text-black hover:text-black cursor-pointer"
        onClick={() => onCreatorClick(creator.username)}
      >
        {showRank && (
          <div className="relative">
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded flex items-center">
              {<Crown className="h-3 w-3 mr-1" />}#{creator.rank}
            </div>
          </div>
        )}
        <img
          className="w-12 h-12 rounded-full object-cover mr-3"
          src={creator.avatar || '/assets/no-image.svg'}
          alt={creator.name}
        />
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium text-gray-900">{creator.username}</span>
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center ml-1">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">{creator.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400">{creator.likes}いいね</p>
            <p className="text-xs text-gray-400">|</p>
            <p className="text-xs text-gray-400">{creator.followers}人のフォロワー</p>
          </div>
        </div>
      </div>
      {!isSelf && (
        <Button
          variant="subscribe"
          size="sm"
          onClick={() => {
            onFollowClick(creator.is_following, creator.id);
          }}
          disabled={showFollowButton}
        >
          {creator.is_following ? (
            <UserCheck className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
