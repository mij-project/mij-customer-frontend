import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountInfo } from '@/features/account/types';
import PostCard from '@/features/account/components/PostCard';

interface LikedPostsSectionProps {
  accountInfo: AccountInfo | null;
}

export default function LikedPostsSection({ accountInfo }: LikedPostsSectionProps) {
  const navigate = useNavigate();
  const likedPosts = accountInfo?.social_info?.liked_posts || [];
  const totalLikes = accountInfo?.social_info?.liked_posts.length || 0;

  const handleUserClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  return (
    <div className="px-6 py-8">
      <div className="bg-white mb-4">
        <div className="text-center mb-4">
          <div className="text-lg font-bold text-gray-900">{totalLikes}件</div>
        </div>

        {likedPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {likedPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                thumbnailUrl={post.thumbnail_key || '/assets/no-image.svg'}
                title={post.description || ''}
                creatorAvatar={post.avatar_url || '/assets/no-image.svg'}
                creatorName={post.profile_name}
                creatorUsername={post.username}
                likesCount={0}
                commentsCount={0}
                onClick={handlePostClick}
                onCreatorClick={handleUserClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">いいねした投稿はありません</div>
        )}
      </div>
    </div>
  );
}
