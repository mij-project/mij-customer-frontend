import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleBookmark, getBookmarkStatus } from '@/api/endpoints/social';
import { useAuth } from '@/providers/AuthContext';

interface BookmarkButtonProps {
  postId: string;
  initialBookmarked?: boolean;
  className?: string;
}

export default function BookmarkButton({
  postId,
  initialBookmarked = false,
  className = '',
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // ログインしている場合のみ、ブックマーク状態を取得
    if (user) {
      const fetchBookmarkStatus = async () => {
        try {
          const response = await getBookmarkStatus(postId);
          setBookmarked(response.data.bookmarked);
        } catch (error) {
          console.error('Failed to fetch bookmark status:', error);
          // エラーの場合は初期値を使用
          setBookmarked(initialBookmarked);
        }
      };

      fetchBookmarkStatus();
    } else {
      // 未ログインの場合は初期値を使用
      setBookmarked(false);
    }
  }, [postId, user, initialBookmarked]);

  const handleToggleBookmark = async () => {
    if (loading) return;

    // 未ログインの場合は何もしない（ログインダイアログを表示するなどの処理を後で追加可能）
    if (!user) {
      console.log('Login required to bookmark posts');
      return;
    }

    setLoading(true);
    try {
      const response = await toggleBookmark(postId);
      setBookmarked(response.data.bookmarked || false);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        bookmarked ? 'text-yellow-600' : 'text-gray-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
    </button>
  );
}
