import React from 'react';
import { Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileSectionProps } from '@/features/account/personal/section/types';
import { useAuth } from '@/providers/AuthContext';
import { UserRole } from '@/utils/userRole';

export default function ProfileSection({ user }: ProfileSectionProps) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  console.log(user);
  return (
    <div className="p-6 text-center">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 flex flex-col items-start">
          <h1 className="text-lg font-medium text-gray-900">{user.name}</h1>

          {authUser?.role === UserRole.CREATOR && (
            <>
              <p className="text-gray-600 text-sm">{user.username}</p>
              <div className="flex items-center">
                <div className="flex bg-gray-100 rounded-lg p-4 items-center mt-1">
                  <button
                    className="text-blue-500 text-sm flex items-center"
                    onClick={() => navigate(`/profile?username=${user.username}`)}
                  >
                    プロフィールを見る
                  </button>
                </div>
                <Edit
                  className="h-4 w-4 ml-1 cursor-pointer"
                  onClick={() => navigate('/account/edit')}
                />
              </div>
            </>
          )}
        </div>
        <div className="w-24 h-24 flex-shrink-0">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full rounded-full object-cover bg-gray-200"
          />
        </div>
      </div>
      {authUser?.role === UserRole.CREATOR && (
        <div className="flex justify-center bg-gray-100 rounded-lg p-4 rounded-full space-x-8 text-sm mt-10">
          <div className="text-center">
            <div className="text-gray-600">フォロー</div>
            <div className="font-medium">{user.followingCount}人</div>
          </div>
          <div className="w-px h-15 bg-gray-300"></div>
          <div className="text-center">
            <div className="text-gray-600">フォロワー</div>
            <div className="font-medium">{user.followerCount}人</div>
          </div>
          <div className="w-px h-15 bg-gray-300"></div>
          <div className="text-center">
            <div className="text-gray-600">総いいね</div>
            <div className="font-medium">{user.totalLikes}件</div>
          </div>
        </div>
      )}
      {authUser?.role === UserRole.USER && (
        <div className="flex justify-center bg-gray-100 rounded-lg p-4 rounded-full space-x-8 text-sm mt-10">
          <div className="text-center">
            <div className="text-gray-600">フォロー</div>
            <div className="font-medium">{user.followingCount}人</div>
          </div>
        </div>
      )}
    </div>
  );
}
