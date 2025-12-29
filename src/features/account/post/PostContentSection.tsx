import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, MoreVertical, ImageIcon, PlayIcon, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ✅ Dialog imports (shadcn)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deletePost } from '@/api/endpoints/post';

interface Post {
  id: string;
  title: string;
  thumbnail: string;
  status: 'review' | 'revision' | 'private' | 'published' | 'deleted' | 'reserved';
  date: string;
  price: number;
  currency: string | null;
  likes_count: number;
  comments_count: number;
  purchase_count: number;
  duration: string | null;
  is_video: boolean;
  created_at: string;
  has_plan: boolean;
  is_time_sale: boolean;
  sale_percentage: number | null;
}

interface PostContentSectionProps {
  posts: Post[];
  activeStatus: string;
  statusLabels: Record<string, string>;
  onDeleted?: (postId: string) => void;
}

type SortOption = 'date' | 'likes' | 'price';

export default function PostContentSection({
  posts,
  activeStatus,
  statusLabels,
  onDeleted,
}: PostContentSectionProps) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('date');

  // ✅ delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const sortedPosts = useMemo(() => {
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
    alert('ピン留め機能は実装予定です');
  };

  // ✅ click "削除" -> open dialog (no delete yet)
  const handleDeletePost = (postId: string) => {
    setSelectedPostId(postId);
    setShowDeleteDialog(true);
  };

  // ✅ confirm delete -> do real delete
  const handleDelete = async () => {
    if (!selectedPostId || actionLoading) return;

    try {
      setActionLoading(true);

      await deletePost(selectedPostId);

      toast('投稿を削除しました', {
        icon: <Check className="w-4 h-4" color="#6DE0F7" />,
      });

      setShowDeleteDialog(false);
      setSelectedPostId(null);
      onDeleted?.(selectedPostId);
    } catch (err) {
      toast('削除に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = (postId: string) => {
    const link = `${window.location.origin}/post/detail?post_id=${postId}`;
    navigator.clipboard.writeText(link);
    toast('リンクをコピーしました', {
      icon: <Check className="w-4 h-4" color="#6DE0F7" />,
    });
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
      {/* ✅ Delete confirm dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>投稿を削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。投稿を完全に削除してもよろしいですか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={actionLoading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? '処理中...' : '削除する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* プロフィールの並び替えを変更ボタン */}
      <div className="flex justify-end">
        <DropdownMenu modal={false}>
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
      <div className="space-y-3">
        {sortedPosts.map((post) => {
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'published':
                return 'bg-green-100 text-green-700';
              case 'review':
                return 'bg-yellow-100 text-yellow-700';
              case 'revision':
                return 'bg-orange-100 text-orange-700';
              case 'private':
                return 'bg-gray-100 text-gray-700';
              case 'reserved':
                return 'bg-blue-100 text-blue-700';
              default:
                return 'bg-gray-100 text-gray-700';
            }
          };

          return (
            <div
              key={post.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* ヘッダー */}
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_video ? (
                        <PlayIcon className="w-4 h-4 text-primary" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-primary" />
                      )}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                          post.status
                        )}`}
                      >
                        {statusLabels[post.status]}
                      </span>
                      {post.is_time_sale && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          セール中{post.sale_percentage ? `(${post.sale_percentage}%)` : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 truncate">{post.title}</h3>
                  </div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
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

                      {['published', 'reserved'].includes(post.status) && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(post.id);
                          }}
                        >
                          リンクをコピー
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id);
                        }}
                        className="text-red-600"
                      >
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* メイン情報 */}
              <div className="p-4">
                <div className="flex gap-4">
                  {/* サムネイル */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>

                  {/* 情報エリア */}
                  <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
                    {/* 左列 */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">作成日</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(post.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      {post.price > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">価格</p>
                          <p className="text-sm font-bold text-black">¥{post.price.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* 右列 */}
                    {post.status === 'published' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs text-gray-500">購入</p>
                            <p className="text-lg font-bold text-black">{post.purchase_count}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">いいね</p>
                            <p className="text-lg font-bold text-black">{post.likes_count}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* タイムセール関連ボタン */}
                {['published', 'reserved'].includes(post.status) && post?.price > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button
                        className="flex-1 bg-primary text-white border border-amber-200 px-3 py-2 rounded-lg font-semibold hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 transition-all text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/account/post/price-timesale-setting/create/${post.id}`);
                        }}
                      >
                        タイムセール作成
                      </button>
                      <button
                        className="flex-1 bg-secondary hover:bg-secondary/90 text-gray-900 px-3 py-2 rounded-lg font-semibold transition-all text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/account/post/price-timesale-setting/${post.id}`);
                        }}
                      >
                        タイムセール一覧
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
