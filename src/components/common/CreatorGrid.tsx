import { Creator } from '@/features/top/types';
import CreatorCard from './CreatorCard';
import { useAuth } from '@/providers/AuthContext';
import SpecialCreatorCard from './SpecialCreatorCard';

interface CreatorGridProps {
  creators: Creator[];
  showRank?: boolean;
  showFollowButton?: boolean;
  isSpecialShow?: boolean;
  onCreatorClick: (username: string) => void;
  onFollowClick: (isFollowing: boolean, creatorId: string) => void;
}

export default function CreatorGrid({
  creators,
  showRank = false,
  onCreatorClick,
  onFollowClick,
  showFollowButton = true,
  isSpecialShow = false,
}: CreatorGridProps) {
  return (
    <div>
      <div>
        {creators.map((creator) => {
          if (isSpecialShow && creator.rank === 1) {
            return (
              <SpecialCreatorCard
                key={creator.id}
                creator={creator}
                showRank={showRank}
                onCreatorClick={onCreatorClick}
                onFollowClick={onFollowClick}
                showFollowButton={showFollowButton}
              />
            );
          }
          return (
            <CreatorCard
              key={creator.id}
              creator={creator}
              showRank={showRank}
              onCreatorClick={onCreatorClick}
              onFollowClick={onFollowClick}
              showFollowButton={showFollowButton}
            />
          );
        })}
      </div>
    </div>
  );
}
