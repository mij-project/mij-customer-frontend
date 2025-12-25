import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { toggleFollow, getFollowStatus } from '@/api/endpoints/social';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthContext';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  className?: string;
  onAuthRequired?: () => void;
}

export default function FollowButton({
  userId,
  initialFollowing = false,
  className = '',
  onAuthRequired,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // ログインしている場合のみ初期状態を取得
    if (!user) {
      return;
    }
    const fetchFollowStatus = async () => {
      try {
        const response = await getFollowStatus(userId);
        setFollowing(response.data.following);
      } catch (error) {
        console.error('Failed to fetch follow status:', error);
      }
    };

    fetchFollowStatus();
  }, [userId, user]);

  const handleToggleFollow = async () => {
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
      const response = await toggleFollow(userId);
      setFollowing(response.data.following || false);
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
      className={`bg-primary hover:bg-primary/90 text-white rounded-full py-2.5 px-5 h-9 font-medium
         ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {following ? (
        <>
          <span className="text-xs font-medium">フォロー中</span>
        </>
      ) : (
        <>
          <span className="text-xs font-medium">フォロー</span>
        </>
      )}
    </Button>
  );
}
