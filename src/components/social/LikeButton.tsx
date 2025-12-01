import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike, getLikeStatus } from '@/api/endpoints/social';
import { useAuth } from '@/providers/AuthContext';

interface LikeButtonProps {
  postId: string;
  initialLiked?: boolean;
  initialCount?: number;
  className?: string;
  onAuthRequired?: () => void;
}

export default function LikeButton({
  postId,
  initialLiked = false,
  initialCount = 0,
  className = '',
  onAuthRequired,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // initialLikedが明示的に渡されている場合は、API呼び出しをスキップ
    if (initialLiked !== undefined) {
      setLiked(initialLiked);
      setLikesCount(initialCount);
      return;
    }

    // ログインしている場合のみ、いいね状態を取得
    if (user) {
      const fetchLikeStatus = async () => {
        try {
          const response = await getLikeStatus(postId);
          setLiked(response.data.liked);
          setLikesCount(response.data.likes_count);
        } catch (error) {
          console.error('Failed to fetch like status:', error);
          // エラーの場合は初期値を使用
          setLikesCount(initialCount);
        }
      };

      fetchLikeStatus();
    } else {
      // 未ログインの場合は初期値を使用
      setLikesCount(initialCount);
      setLiked(false);
    }
  }, [postId, user, initialCount, initialLiked]);

  const handleToggleLike = async () => {
    if (loading) return;

    // 未ログインの場合はAuthDialogを表示
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }

    setLoading(true);
    try {
      const response = await toggleLike(postId);
      setLiked(response.data.liked || false);

      // いいね数を更新
      const statusResponse = await getLikeStatus(postId);
      setLikesCount(statusResponse.data.likes_count);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center pl-1 space-x-2 h-6 transition-colors ${
        liked ? 'text-red-500' : 'text-gray-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <Heart className={`h-3 w-3 ${liked ? 'fill-current' : ''}`} />
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  );
}
