import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountHeader from '@/features/account/components/AccountHeader';
import PostFilterBar from '@/features/account/components/PostFilterBar';
import PostCard from '@/features/account/components/PostCard';
import EmptyState from '@/features/account/components/EmptyState';
import { getBookmarkedPosts } from '@/api/endpoints/account';

type FilterType = 'all' | 'image' | 'video';
type SortType = 'newest' | 'oldest' | 'popular';

interface BookmarkPost {
  id: string;
  thumbnailUrl: string;
  title: string;
  creatorAvatar: string;
  creatorName: string;
  creatorUsername: string;
  likesCount: number;
  commentsCount: number;
  duration?: string;
  isVideo: boolean;
  bookmarkedAt: string;
}

export default function BookmarkPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [bookmarks, setBookmarks] = useState<BookmarkPost[]>([]);
  const [loading, setLoading] = useState(true);

  // スクロール位置の保存と復元
  useEffect(() => {
    const scrollKey = `scroll-position-${location.pathname}`;
    
    // ページが表示されたときにスクロール位置を復元
    const savedScrollPosition = sessionStorage.getItem(scrollKey);
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
      }, 100);
    }

    // スクロール位置を保存
    const handleScroll = () => {
      sessionStorage.setItem(scrollKey, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await getBookmarkedPosts();
        const formattedBookmarks = response.bookmarks.map((item: any) => ({
          id: item.id,
          thumbnailUrl: item.thumbnail_url,
          title: item.title,
          creatorAvatar: item.creator_avatar,
          creatorName: item.creator_name,
          creatorUsername: item.creator_username,
          likesCount: item.likes_count,
          commentsCount: item.comments_count,
          duration: item.duration,
          isVideo: item.is_video,
          bookmarkedAt: item.created_at,
        }));
        setBookmarks(formattedBookmarks);
      } catch (error) {
        console.error('ブックマーク取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const handlePostClick = (postId: string) => {
    // スクロール位置を保存
    const scrollKey = `scroll-position-${location.pathname}`;
    sessionStorage.setItem(scrollKey, window.scrollY.toString());
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  // Filter posts based on active filter
  const filteredPosts = bookmarks.filter((post) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'image') return !post.isVideo;
    if (activeFilter === 'video') return post.isVideo;
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <AccountHeader title="保存した投稿" showBackButton={true} onBack={() => navigate(-1)} />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
      <div className="min-h-screen bg-gray-50 pb-20">
        <AccountHeader title="保存した投稿" showBackButton={true} onBack={() => navigate(-1)} />

        {/* Filter Bar */}
        <div className="fixed top-0 left-0 right-0 z-10 mt-16">
          <PostFilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Posts Grid */}
        <div className="p-4 pt-20">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  thumbnailUrl={post.thumbnailUrl}
                  title={post.title}
                  creatorAvatar={post.creatorAvatar}
                  creatorName={post.creatorName}
                  creatorUsername={post.creatorUsername}
                  likesCount={post.likesCount}
                  commentsCount={post.commentsCount}
                  duration={post.duration}
                  isVideo={post.isVideo}
                  onClick={handlePostClick}
                  onCreatorClick={handleCreatorClick}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="保存した投稿がありません" />
          )}
        </div>
      </div>
    </div>
  );
}
