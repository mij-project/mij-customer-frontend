import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountInfo } from '@/features/account/types';

interface LikedPostsSectionProps {
  accountInfo: AccountInfo | null;
}

export default function LikedPostsSection({ accountInfo }: LikedPostsSectionProps) {
  const navigate = useNavigate();
  const likedPosts = accountInfo?.social_info?.liked_posts || [];
  const totalLikes = accountInfo?.social_info?.liked_posts.length || 0;

  const handleUserClick = (username: string) => {
    navigate(`/account/profile?username=${username}`);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  return (
    <div className="px-6 py-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-gray-900 mb-4">いいねした投稿</h3>
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-gray-900">{totalLikes}件</div>
        </div>

        {likedPosts.length > 0 ? (
          <div className="space-y-3">
            {likedPosts.map((post) => (
              <div key={post.id} className="border border-gray-100 rounded p-3">
                <div
                  className="flex items-start space-x-3"
                  onClick={() => handlePostClick(post.id)}
                >
                  <img
                    src={post.avatar_url || '/assets/no-image.svg'}
                    alt={post.profile_name}
                    className="w-10 h-10 rounded-full object-cover"
                    onClick={() => handleUserClick(post.username)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{post.profile_name}</div>
                    <div className="text-xs text-gray-500">@{post.username}</div>
                    <div className="text-sm mt-1">{post.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(post.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <img
                      src={post.thumbnail_key || '/assets/no-image.svg'}
                      alt="投稿のサムネイル"
                      className="w-16 h-16 rounded object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">いいねした投稿はありません</div>
        )}
      </div>
    </div>
  );
}
