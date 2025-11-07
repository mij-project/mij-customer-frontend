import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PostManagementSectionProps } from '@/features/account/section/types';

export default function PostManagementSection({ accountInfo }: PostManagementSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-4">投稿管理</h3>
      <div className="grid grid-cols-5 gap-2 text-center text-sm">
        <div>
          <div className="text-gray-600">審査中</div>
          <div className="font-medium">{accountInfo?.posts_info?.pending_posts_count || 0}</div>
        </div>
        <div>
          <div className="text-gray-600">要修正</div>
          <div className="font-medium">{accountInfo?.posts_info?.rejected_posts_count || 0}</div>
        </div>
        <div>
          <div className="text-gray-600">非公開</div>
          <div className="font-medium">{accountInfo?.posts_info?.unpublished_posts_count || 0}</div>
        </div>
        <div>
          <div className="text-primary">公開済み</div>
          <div className="font-medium text-primary">
            {accountInfo?.posts_info?.approved_posts_count || 0}
          </div>
        </div>
        <div>
          <div className="text-gray-600">削除</div>
          <div className="font-medium">{accountInfo?.posts_info?.deleted_posts_count || 0}</div>
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
