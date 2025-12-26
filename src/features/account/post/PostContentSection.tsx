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

                {post.status === 'published' && (
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" />
                      <span>{post.purchase_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes_count}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3ドットメニュー */}
              <div className="flex flex-col items-end flex-shrink-0 gap-4">
                <DropdownMenu modal={false}>
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
                    >
                      <p className="text-red-500">削除</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* {['published', 'reserved'].includes(post.status) && post?.price > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs "
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/account/post/price-timesale-setting/${post.id}`);
                    }}
                  >
                    <span>タイムセール(単品価格)</span>
                  </Button>
                )} */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
