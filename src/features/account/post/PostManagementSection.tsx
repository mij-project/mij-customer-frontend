import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PostManagementSectionProps } from '@/features/account/personal/section/types';

export default function PostManagementSection({ accountInfo }: PostManagementSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
      <h3 className="font-medium text-gray-900 mb-4 text-center">投稿管理</h3>
      <div className="grid grid-cols-5 gap-2 text-center text-sm">
        <div>
          <div className="text-gray-600 whitespace-nowrap">審査中</div>
          <div className="font-medium">{accountInfo?.posts_info?.pending_posts_count || 0}</div>
        </div>
        <div>
          <div className="text-red-500 whitespace-nowrap">要修正</div>
          <div className="font-medium text-red-500">
            {accountInfo?.posts_info?.rejected_posts_count || 0}
          </div>
        </div>
        <div>
          <div className="text-gray-600 whitespace-nowrap">非公開</div>
          <div className="font-medium">{accountInfo?.posts_info?.unpublished_posts_count || 0}</div>
        </div>
        <div>
          <div className="text-primary whitespace-nowrap">公開済み</div>
          <div className="font-medium text-primary">
            {accountInfo?.posts_info?.approved_posts_count || 0}
          </div>
        </div>
        <div>
          <div className="text-gray-600 whitespace-nowrap">予約中</div>
          <div className="font-medium">{accountInfo?.posts_info?.reserved_posts_count || 0}</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <button className="text-pink-500 text-sm" onClick={() => navigate('/account/post')}>
          すべて見る &gt;
        </button>
      </div>
    </div>
  );
}
