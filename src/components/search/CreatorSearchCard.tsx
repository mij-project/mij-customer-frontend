import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RecentPost {
  id: string;
  thumbnail_url: string | null;
}

interface CreatorSearchCardProps {
  id: string;
  avatar_url: string | null;
  profile_name: string;
  username: string;
  bio?: string | null;
  is_verified: boolean;
  followers_count: number;
  posts_count: number;
  recent_posts?: RecentPost[];
  onClick?: (username: string) => void;
}

const NO_IMAGE_URL = '/assets/no-image.svg';

export default function CreatorSearchCard({
  id,
  avatar_url,
  profile_name,
  username,
  bio,
  is_verified,
  followers_count,
  posts_count,
  recent_posts = [],
  onClick,
}: CreatorSearchCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(username);
    } else {
      navigate(`/profile?username=${username}`);
    }
  };

  const handlePostClick = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    navigate(`/post/detail?post_id=${postId}`);
  };

  return (
    <div
      className="bg-white py-6 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      {/* クリエイター情報 - 中央配置 */}
      <div className="flex flex-col items-center text-center mb-4">
        <img
          src={avatar_url || NO_IMAGE_URL}
          alt={profile_name}
          className="w-24 h-24 rounded-full object-cover mb-3"
          onError={(e) => {
            e.currentTarget.src = NO_IMAGE_URL;
          }}
        />
        <h3 className="font-bold text-gray-900 text-base mb-1">{profile_name}</h3>
        <p className="text-sm text-gray-500 mb-2">@{username}</p>
        {bio && <p className="text-sm text-gray-600 line-clamp-2 px-4 mb-3">{bio}</p>}
      </div>

      {/* 最新投稿サムネイル - 横スクロール */}
      {recent_posts && recent_posts.length > 0 && (
        <div className="px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {recent_posts.map((post) => (
              <div
                key={post.id}
                className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity relative"
                onClick={(e) => handlePostClick(e, post.id)}
              >
                <img
                  src={post.thumbnail_url || NO_IMAGE_URL}
                  alt="投稿サムネイル"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = NO_IMAGE_URL;
                  }}
                />
                {/* 再生アイコン */}
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5 3.5v9l7-4.5-7-4.5z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
