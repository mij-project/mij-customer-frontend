import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfilePlan } from '@/api/types/profile';
import PlanCard from './PlanCard';
import PostCard from '@/components/common/PostCard';

interface Post {
  id: string;
  post_type: number; // 1: 動画, 2: 画像
  likes_count: number;
  description?: string;
  thumbnail_url?: string;
  video_duration?: number;
  price?: number;
  currency?: string;
  created_at: string;
}

interface Plan extends ProfilePlan {}

interface IndividualPurchase {
  id: string;
  likes_count: number;
  description?: string;
  thumbnail_url?: string;
  video_duration?: number;
  created_at: string;
  price?: number;
  currency?: string;
}

interface ContentSectionProps {
  activeTab:
    | 'posts'
    | 'plans'
    | 'individual'
    | 'gacha'
    | 'videos'
    | 'images'
    | 'likes'
    | 'bookmarks';
  posts: Post[];
  plans: Plan[];
  individualPurchases: IndividualPurchase[];
  likedPosts: any[];
  bookmarkedPosts: any[];
  likesLoading: boolean;
  bookmarksLoading: boolean;
  isOwnProfile: boolean;
  onPlanJoin: (plan: Plan) => void;
  onAuthRequired?: () => void;
}

const NO_IMAGE_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEwMCAxMDBaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTRBRiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

export default function ContentSection({
  activeTab,
  posts,
  plans,
  individualPurchases,
  likedPosts,
  bookmarkedPosts,
  likesLoading,
  bookmarksLoading,
  onPlanJoin,
  isOwnProfile,
  onAuthRequired,
}: ContentSectionProps) {
  const navigate = useNavigate();

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const renderEmptyState = (type: string) => (
    <div className="p-6 text-center text-gray-500">{type}はありません。</div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                post_type={post.post_type}
                thumbnail_url={post.thumbnail_url}
                description={post.description}
                video_duration={post.video_duration}
                price={post.price}
                currency={post.currency}
                created_at={post.created_at}
                variant="simple"
                showTitle={true}
                onClick={handlePostClick}
              />
            ))}
          </div>
        ) : (
          renderEmptyState('投稿')
        );

      case 'videos':
        const videos = posts.filter((post) => post.post_type === 1);
        return videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {videos.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                post_type={post.post_type}
                thumbnail_url={post.thumbnail_url}
                description={post.description}
                video_duration={post.video_duration}
                price={post.price}
                currency={post.currency}
                created_at={post.created_at}
                variant="simple"
                showTitle={true}
                onClick={handlePostClick}
              />
            ))}
          </div>
        ) : (
          renderEmptyState('動画')
        );

      case 'images':
        const images = posts.filter((post) => post.post_type === 2);
        return images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {images.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                post_type={post.post_type}
                thumbnail_url={post.thumbnail_url}
                description={post.description}
                video_duration={post.video_duration}
                price={post.price}
                currency={post.currency}
                created_at={post.created_at}
                variant="simple"
                showTitle={true}
                onClick={handlePostClick}
              />
            ))}
          </div>
        ) : (
          renderEmptyState('画像')
        );

      case 'plans':
        return plans.length > 0 ? (
          <div className="px-4 pb-24">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onJoin={onPlanJoin} isOwnProfile={isOwnProfile} onAuthRequired={onAuthRequired} />
            ))}
          </div>
        ) : (
          renderEmptyState('プラン')
        );

      case 'individual':
        return individualPurchases.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {individualPurchases.map((purchase) => (
              <PostCard
                key={purchase.id}
                id={purchase.id}
                post_type={1} // individualPurchasesには post_type がないため、デフォルト値を設定
                thumbnail_url={purchase.thumbnail_url}
                description={purchase.description}
                video_duration={purchase.video_duration}
                price={purchase.price}
                currency={purchase.currency}
                created_at={purchase.created_at}
                variant="simple"
                showTitle={true}
                showDate={false}
                onClick={handlePostClick}
              />
            ))}
          </div>
        ) : (
          renderEmptyState('単品販売')
        );


      case 'likes':
        if (likesLoading) {
          return <div className="p-6 text-center text-gray-500 pb-24">読み込み中...</div>;
        }

        return likedPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {likedPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                post_type={post.is_video ? 1 : 2}
                thumbnail_url={post.thumbnail_url}
                description={post.title}
                duration={post.duration}
                created_at={post.created_at}
                price={post.price}
                currency={post.currency}
                variant="simple"
                showTitle={true}
                onClick={handlePostClick}
              />
            ))}
          </div>
        ) : (
          renderEmptyState('いいねした投稿')
        );

      case 'bookmarks':
        if (bookmarksLoading) {
          return <div className="p-6 text-center text-gray-500 pb-24">読み込み中...</div>;
        }

        return bookmarkedPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1 pb-24">
            {bookmarkedPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                post_type={post.is_video ? 1 : 2}
                thumbnail_url={post.thumbnail_url}
                description={post.title}
                duration={post.duration}
                created_at={post.created_at}
                price={post.price}
                currency={post.currency}
                variant="simple"
                showTitle={true}
                onClick={handlePostClick}
              />
            ))}
          </div>
        ) : (
          renderEmptyState('保存済み投稿')
        );

      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
}
