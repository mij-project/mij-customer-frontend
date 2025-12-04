import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import PostsSection from '@/components/common/PostsSection';
import { getNewArrivals } from '@/api/endpoints/post';
import { PostCardProps } from '@/components/common/PostCard';

export default function PostNewArrivals() {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      const response = await getNewArrivals();
      setNewArrivals(response);
    };
    fetchNewArrivals();
  }, []);

  const convertToPosts = (posts: any[]): PostCardProps[] => {
    return posts.map((post) => ({
      id: post.id,
      post_type: post.post_type || 1,
      title: post.description || '',
      thumbnail: post.thumbnail_url || 'https://picsum.photos/300/200?random=1',
      duration: post.duration || 0,
      views: 0,
      likes: post.likes_count || 0,
      creator: {
        name: post.creator_name,
        username: post.username,
        avatar: post.creator_avatar_url || 'https://picsum.photos/40/40?random=1',
        verified: false,
        official: post.official,
      },
      rank: 'rank' in post ? post.rank : undefined,
    }));
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  return (
    <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <PostsSection
          title="新着投稿"
          posts={convertToPosts(newArrivals)}
          showRank={false}
          columns={2}
          onPostClick={handlePostClick}
          onCreatorClick={handleCreatorClick}
          showMoreButton={false}
        />
        <BottomNavigation />
      </div>
    </div>
  );
}
