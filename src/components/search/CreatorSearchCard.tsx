import React from 'react';
import { useNavigate } from 'react-router-dom';
import OfficalBadge from '../common/OfficalBadge';
import { Tags } from 'lucide-react';

interface RecentPost {
  id: string;
  thumbnail_url: string | null;
  is_time_sale?: boolean;
}

interface CreatorSearchCardProps {
  id: string;
  avatar_url: string | null;
  profile_name: string;
  username: string;
  bio?: string | null;
  is_verified: boolean;
  official: boolean;
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
  official,
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
        <h3 className="font-bold text-gray-900 text-base mb-1">
          {profile_name}{' '}
          {official && (
            <span className="ml-1">
              <OfficalBadge />
            </span>
          )}
        </h3>
        <p className="text-sm text-gray-500 mb-2">@{username}</p>
        {bio && <p className="text-sm text-gray-600 line-clamp-2 px-4 mb-3">{bio}</p>}
      </div>

      {/* 最新投稿サムネイル - 5件横並び */}
      <div className="px-4">
        <div className="grid grid-cols-5 gap-1">
          {[0, 1, 2, 3, 4].map((index) => {
            const post = recent_posts[index];
            return (
              <div
                key={post?.id || `empty-${index}`}
                className="relative aspect-square rounded overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => post && handlePostClick(e, post.id)}
              >
                {post ? (
                  <>
                    <img
                      src={post.thumbnail_url || NO_IMAGE_URL}
                      alt="投稿サムネイル"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = NO_IMAGE_URL;
                      }}
                    />

                    {post.is_time_sale && (
                      <div className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                        <Tags className="h-3 w-3" />
                        <span className="whitespace-nowrap">セール中</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
