import React, { useState } from 'react';
import LikeButton from '@/components/social/LikeButton';
import FollowButton from '@/components/social/FollowButton';
import BookmarkButton from '@/components/social/BookmarkButton';
import CommentSection from '@/components/social/CommentSection';

// テスト用のダミーデータ
const DUMMY_POST_ID = '123e4567-e89b-12d3-a456-426614174000';
const DUMMY_USER_ID = '987fcdeb-51a2-43d1-9f12-345678901234';

export default function SocialTest() {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ソーシャル機能テストページ</h1>

          <div className="space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">1. フォロー機能</h2>
              <div className="flex items-center space-x-4">
                <FollowButton userId={DUMMY_USER_ID} />
                <span className="text-sm text-gray-600">テストユーザー: {DUMMY_USER_ID}</span>
              </div>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">2. いいね機能</h2>
              <div className="flex items-center space-x-4">
                <LikeButton postId={DUMMY_POST_ID} initialCount={42} />
                <span className="text-sm text-gray-600">テスト投稿: {DUMMY_POST_ID}</span>
              </div>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">3. ブックマーク機能</h2>
              <div className="flex items-center space-x-4">
                <BookmarkButton postId={DUMMY_POST_ID} />
                <span className="text-sm text-gray-600">同じテスト投稿を使用</span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">4. コメント機能</h2>
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showComments ? 'コメントを非表示' : 'コメントを表示'}
                </button>
                <span className="text-sm text-gray-600">コメントセクションの表示/非表示</span>
              </div>

              {showComments && <CommentSection postId={DUMMY_POST_ID} className="mt-4" />}
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-md font-semibold text-yellow-900 mb-2">テスト方法</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>1. バックエンドサーバーが起動していることを確認してください</li>
              <li>2. 各ボタンをクリックしてAPI通信が正常に動作するかテストしてください</li>
              <li>3. ブラウザの開発者ツールでネットワークタブを確認してください</li>
              <li>4. エラーが発生した場合、コンソールログを確認してください</li>
              <li>5. 認証が必要な機能はログイン後にテストしてください</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-md font-semibold text-blue-900 mb-2">API エンドポイント確認</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• フォロー: POST /social/follow/{DUMMY_USER_ID}</div>
              <div>• いいね: POST /social/like/{DUMMY_POST_ID}</div>
              <div>• ブックマーク: POST /social/bookmark/{DUMMY_POST_ID}</div>
              <div>• コメント: POST /social/comments/{DUMMY_POST_ID}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
