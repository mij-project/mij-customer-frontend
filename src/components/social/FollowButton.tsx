import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { toggleFollow, getFollowStatus } from '@/api/endpoints/social';
import { Button } from '@/components/ui/button';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  className?: string;
}

export default function FollowButton({
  userId,
  initialFollowing = false,
  className = '',
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 初期状態を取得
    const fetchFollowStatus = async () => {
      try {
        const response = await getFollowStatus(userId);
        setFollowing(response.data.following);
      } catch (error) {
        console.error('Failed to fetch follow status:', error);
      }
    };

    fetchFollowStatus();
  }, [userId]);

  const handleToggleFollow = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await toggleFollow(userId);
      setFollowing(response.data.following || false);

      console.log(response.data.following);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-2
         ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {following ? (
        <>
          <span className="text-sm font-medium">フォロー中</span>
        </>
      ) : (
        <>
          <span className="text-sm font-medium">フォロー</span>
        </>
      )}
    </Button>
  );
}
