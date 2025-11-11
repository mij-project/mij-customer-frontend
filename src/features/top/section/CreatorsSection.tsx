import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Creator, CreatorsSectionProps } from '@/features/top/types';
import CreatorGrid from '@/components/common/CreatorGrid';
import SpecialCreatorCard from '@/components/common/SpecialCreatorCard';

export default function CreatorsSection({
  title,
  creators,
  showRank = false,
  onCreatorClick,
  showMoreButton = true,
  onShowMoreClick,
  scrollable = true,
  onFollowClick,
  isShowFollowButton = true,
  isSpecialShow = false,
}: CreatorsSectionProps) {
  const navigate = useNavigate();
  const handleCreatorClick = (username: string) => {
    if (onCreatorClick) {
      onCreatorClick(username);
    } else {
      navigate(`/account/profile?username=${username}`);
    }
  };

  return (
    <section className="bg-white py-6 border-t border-gray-200">
      <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-6 ">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {showMoreButton && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-accent hover:text-primary"
              onClick={onShowMoreClick}
            >
              もっと見る
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
        <CreatorGrid
          creators={creators}
          showRank={showRank}
          onCreatorClick={handleCreatorClick}
          onFollowClick={onFollowClick}
          showFollowButton={isShowFollowButton}
          isSpecialShow={isSpecialShow}
        />

      </div>
    </section>
  );
}
