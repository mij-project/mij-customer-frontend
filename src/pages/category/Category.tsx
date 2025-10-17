import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPostsByCategory } from '@/api/endpoints/post';

import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { PostCategory } from '@/features/category/types';
import PostsSection from '@/components/common/PostsSection';
import { PostCardProps } from '@/components/common/PostCard';
	
export default function Category() {
	const [searchParams] = useSearchParams();
	const [posts, setPosts] = useState<PostCategory[]>([]);
	const slug = searchParams.get('slug');
	const navigate = useNavigate();
	
	useEffect(() => {
		if (!slug) {
			navigate('/');
		}
		const fetchCategory = async () => {
			try {
				const response = await getPostsByCategory(slug);
				// いいね数の多い順でソート
				const sortedPosts = response.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
				setPosts(sortedPosts);
			} catch (error) {
				console.error('Error fetching category:', error);
			}
		};

		fetchCategory();
	}, [slug]);

	const handlePostClick = (postId: string) => {
		navigate(`/post/detail?post_id=${postId}`);
	};

  const handleCreatorClick = (username: string) => {
    navigate(`/account/profile?username=${username}`);
  };


  const convertToPosts = (posts: PostCategory[]): PostCardProps[] => {
    return posts.map(post => ({
      id: post.id,
      post_type: post.post_type,
      title: post.description || '',
      thumbnail: post.thumbnail_url || 'https://picsum.photos/300/200?random=1',
      duration: '00:00',
      views: 0,
      likes: post.likes_count,
      creator: {
        name: post.creator_name,
        username: post.username,
        avatar: post.creator_avatar_url || 'https://picsum.photos/40/40?random=1',
        verified: false
      },
      rank: undefined
    }));
  };

  return (
    <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
			<div className="min-h-screen bg-gray-50 pb-20">
				<Header />
				<PostsSection
					title="カテゴリー別ランキング"
					showMoreButton={false}
					posts={convertToPosts(posts)}
					onCreatorClick={handleCreatorClick}
					showRank={false}
					columns={2}
					onPostClick={handlePostClick}
				/>
				<BottomNavigation />
			</div>
		</div>
  );
}