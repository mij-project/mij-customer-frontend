import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, MoreVertical, ImageIcon, PlayIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface Post {
  id: string;
  title: string;
  thumbnail: string;
  status: 'review' | 'revision' | 'private' | 'published' | 'deleted';
  date: string;
  price: number;
  currency: string | null;
  likes_count: number;
  comments_count: number;
  purchase_count: number;
  duration: string | null;
  is_video: boolean;
  created_at: string;
}

interface PostContentSectionProps {
  posts: Post[];
  activeStatus: string;
  statusLabels: Record<string, string>;
}

type SortOption = 'date' | 'likes' | 'price';

export default function PostContentSection({
  posts,
  activeStatus,
  statusLabels,
}: PostContentSectionProps) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('date');

  // ソート処理
  const sortedPosts = React.useMemo(() => {
    const sorted = [...posts];
    switch (sortBy) {
      case 'date':
        return sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'likes':
        return sorted.sort((a, b) => b.likes_count - a.likes_count);
      case 'price':
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  }, [posts, sortBy]);

  const handleEdit = (postId: string) => {
    navigate(`/account/post/${postId}`);
  };

  const handlePin = (postId: string) => {
    // TODO: ピン留め機能実装
    alert('ピン留め機能は実装予定です');
  };

  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <p className="text-gray-500">{statusLabels[activeStatus]}の投稿はありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* プロフィールの並び替えを変更ボタン */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              並び替え
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy('date')}>
              {sortBy === 'date' && '✓ '}作成日順
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('likes')}>
              {sortBy === 'likes' && '✓ '}いいね数順
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('price')}>
              {sortBy === 'price' && '✓ '}価格順
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 投稿リスト */}
      <div className="space-y-1">
        {sortedPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white border-b border-gray-200 rounded-lg p-3 cursor-pointer"
            onClick={() => handleEdit(post.id)}
          >
            <div className="flex items-start gap-3">
              {/* サムネイル */}
              <div className="relative flex-shrink-0">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-24 h-24 object-cover rounded"
                />
                {/* 価格バッジ */}
                {post.price !== undefined && post.price !== null && (
                  <div className="absolute bottom-1 left-1 bg-primary text-black text-xs font-bold px-1 py-0.5 rounded flex items-center gap-1">
                    <span className="text-white">{post.price === 0 ? 'FREE' : `¥${post.price}`}</span>
                  </div>
                )}
                {/* 画像枚数 */}
                <div className="absolute top-1 right-1 bg-white text-gray-700 text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  {!post.is_video && <ImageIcon className="w-3 h-3" />}
                  {post.is_video && <PlayIcon className="w-3 h-3" />}
                </div>
              </div>

              {/* コンテンツ */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</h3>
                </div>

                {/* 作成日 */}
                <p className="text-xs text-gray-500 mb-2">
                  作成日：
                  {new Date(post.created_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>

                {/* 統計情報 */}

                {post.status === 'published' && (
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" />
                      <span>{post.purchase_count}</span>
                    </div>
                    {/* TODO: 購入数を表示 */}
                    {/* <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>74</span>
                    </div> */}
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes_count}</span>
                    </div>
                    {/* <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count}</span>
                    </div> */}
                  </div>
                )}
              </div>

              {/* 3ドットメニュー */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(post.id);
                    }}
                  >
                    投稿を編集
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePin(post.id);
                    }}
                  >
                    ピン留めする
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
