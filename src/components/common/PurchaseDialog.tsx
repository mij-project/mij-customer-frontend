import React from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock } from 'lucide-react';
import { PostDetailData } from '@/api/types/post';
import { formatPrice } from '@/lib/utils';

interface PurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostDetailData;
  onPurchase: (type: 'single' | 'subscription') => void;
}

export default function PurchaseDialog({ isOpen, onClose, post, onPurchase }: PurchaseDialogProps) {
  // サムネイル画像を取得（kind=2）
  const thumbnail = post.thumbnail_key || '';

  // 動画の長さを取得（動画の場合のみ）
  const videoDuration = post.post_type === 1
    ? post.media_info.find(m => m.kind === 4)?.duration
    : null;

  // 動画の長さをフォーマット（秒を分:秒形式に）
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 max-w-none w-full h-auto max-h-[80vh] rounded-t-2xl border-0 bg-white p-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300">
        <DialogTitle className="sr-only">購入確認</DialogTitle>
        <DialogDescription className="sr-only">
          コンテンツの購入を確認し、支払い方法を選択してください
        </DialogDescription>
        <div className="flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">購入確認</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-auto w-auto"
            >
            </Button>
          </div>

          {/* コンテンツ */}
          <div className="p-4 space-y-4">
            {/* 投稿情報 */}
            <div className="flex space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt="コンテンツサムネイル"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{post.description || 'コンテンツ'}</h3>
                <p className="text-sm text-gray-600 truncate">@{post.creator.profile_name}</p>
                {videoDuration && (
                  <p className="text-sm text-gray-500">
                    本編 {formatDuration(videoDuration)}
                  </p>
                )}
              </div>
            </div>

            {/* 価格情報 */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {post.sale_info.price !== null && (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">単品販売</span>
                    <div className="text-lg font-bold text-gray-900">¥{formatPrice(post.sale_info.price)}</div>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={() => onPurchase('single')}
                      className="bg-primary text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      <span>購入する</span>
                    </Button>
                  </div>
                </div>
              )}
              {post.sale_info.plans.length > 0 && post.sale_info.plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">{plan.name}</span>
                    <div className="text-lg font-bold text-gray-900">¥{formatPrice(plan.price)}</div>
                    {plan.description && (
                      <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={() => onPurchase('subscription')}
                      className="bg-primary text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      <span>加入する</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* 購入ボタン */}
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full py-3 rounded-lg"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
