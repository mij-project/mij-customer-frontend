import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import Hls from 'hls.js';
import { getAccountPostDetail, updateAccountPost } from '@/api/endpoints/account';
import { AccountPostDetailResponse } from '@/api/types/account';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AccountPostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<AccountPostDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const sampleVideoRef = useRef<HTMLVideoElement>(null);
  const sampleHlsRef = useRef<Hls | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const mainHlsRef = useRef<Hls | null>(null);

  // 実際のAPIから画像URLリストを取得（画像投稿の場合）
  const mediaUrls = post?.image_urls && post.image_urls.length > 0
    ? post.image_urls
    : [post?.thumbnail_url || '/assets/no-image.svg'];

  useEffect(() => {
    if (postId) {
      fetchPostDetail();
    }
  }, [postId]);

  // HLS動画の初期化ヘルパー関数
  const initializeHLSVideo = (videoElement: HTMLVideoElement | null, videoUrl: string | null, hlsRef: React.MutableRefObject<Hls | null>) => {
    if (!videoElement || !videoUrl) return;

    if (videoUrl.endsWith('.m3u8')) {
      // HLS形式の動画
      if (Hls.isSupported()) {
        // 既存のHLSインスタンスがあれば破棄
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoElement);
        // 自動再生はブラウザの制限により削除（ユーザー操作が必要）
        hlsRef.current = hls;

        return () => {
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
        };
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari などネイティブHLSサポート
        videoElement.src = videoUrl;
        // 自動再生はブラウザの制限により削除（ユーザー操作が必要）
      }
    } else {
      // 通常の動画形式
      videoElement.src = videoUrl;
      // 自動再生はブラウザの制限により削除（ユーザー操作が必要）
    }
  };

  // モーダル用の動画プレイヤー初期化
  useEffect(() => {
    if (showVideoPlayer && currentVideoUrl && videoRef.current) {
      initializeHLSVideo(videoRef.current, currentVideoUrl, hlsRef);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [showVideoPlayer, currentVideoUrl]);

  // サンプル動画の初期化
  useEffect(() => {
    if (post?.sample_video_url && sampleVideoRef.current) {
      const cleanup = initializeHLSVideo(sampleVideoRef.current, post.sample_video_url, sampleHlsRef);
      return cleanup;
    }

    return () => {
      if (sampleHlsRef.current) {
        sampleHlsRef.current.destroy();
        sampleHlsRef.current = null;
      }
    };
  }, [post?.sample_video_url]);

  // 本編動画の初期化
  useEffect(() => {
    if (post?.main_video_url && mainVideoRef.current) {
      const cleanup = initializeHLSVideo(mainVideoRef.current, post.main_video_url, mainHlsRef);
      return cleanup;
    }

    return () => {
      if (mainHlsRef.current) {
        mainHlsRef.current.destroy();
        mainHlsRef.current = null;
      }
    };
  }, [post?.main_video_url]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const data = await getAccountPostDetail(postId!);
      console.log('data', data);
      setPost(data);
    } catch (error) {
      console.error('投稿詳細の取得に失敗しました:', error);
      alert('投稿詳細の取得に失敗しました');
      navigate('/account/post');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setActionLoading(true);
      await updateAccountPost(postId!, { status: 3 }); // UNPUBLISHED = 3
      alert('投稿を非公開にしました');
      navigate('/account/post');
    } catch (error) {
      console.error('非公開化に失敗しました:', error);
      alert('非公開化に失敗しました');
    } finally {
      setActionLoading(false);
      setShowUnpublishDialog(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await updateAccountPost(postId!, { status: 4 }); // DELETED = 4
      alert('投稿を削除しました');
      navigate('/account/post');
    } catch (error) {
      console.error('削除に失敗しました:', error);
      alert('削除に失敗しました');
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = () => {
    navigate(`/account/post/${postId}/edit`);
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageGallery(true);
  };

  const handleVideoClick = (videoUrl: string | null) => {
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl);
      setShowVideoPlayer(true);
    }
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1: return '審査中';
      case 2: return '要修正';
      case 3: return '非公開';
      case 4: return '削除済み';
      case 5: return '公開中';
      default: return '不明';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">投稿が見つかりません</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white min-h-screen">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-center">投稿の概要</h1>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* サムネイルとタイトル */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <img
              src={post.thumbnail_url || '/assets/no-image.svg'}
              alt={post.description}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <h2 className="text-base font-medium text-gray-900">{post.description}</h2>
              <p className="text-sm text-gray-500 mt-1">
                書誌提出日：{new Date(post.created_at).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* 審査ステータス */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">審査ステータス</h3>
              <span className={`px-2 py-0.5 text-xs rounded ${
                post.status === 2 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {getStatusLabel(post.status)}
              </span>
            </div>
            {post.reject_comments && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">却下理由</p>
                  <p className="text-sm text-yellow-800">{post.reject_comments}</p>
                </div>
              </div>
            )}
            {post.status === 5 && (
              <p className="text-sm text-gray-600">この投稿は無期限で公開中です</p>
            )}
            {post.sample_video_reject_comments && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">サンプル動画却下理由</p>
                  <p className="text-sm text-yellow-800">{post.sample_video_reject_comments}</p>
                </div>
              </div>
            )}
            {post.main_video_reject_comments && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">本編動画却下理由</p>
                  <p className="text-sm text-yellow-800">{post.main_video_reject_comments}</p>
                </div>
              </div>
            )}
            {post.image_reject_comments &&
             Array.isArray(post.image_reject_comments) && 
             post.image_reject_comments.some((comment: string | null) => comment !== null) && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">画像却下理由</p>
                  <div className="space-y-2">
                    {post.image_reject_comments
                      .filter((comment: string | null) => comment !== null)
                      .map((comment: string, index: number) => (
                        <p key={index} className="text-sm text-yellow-800">{comment}</p>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 投稿内容 */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">投稿内容</h3>

            {post.is_video ? (
              // 動画投稿の場合: サムネイル、サンプル動画、本編動画を縦に並べる
              <div className="space-y-4">
                {/* サムネイル画像 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">サムネイル画像</p>
                  <div className="relative">
                    <img
                      src={post.thumbnail_url || '/assets/no-image.svg'}
                      alt="サムネイル"
                      className="w-full aspect-video object-cover rounded"
                    />
                  </div>
                </div>

                {/* サンプル動画 */}
                {post.sample_video_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">サンプル動画</p>
                    <video
                      ref={sampleVideoRef}
                      controls
                      className="w-full rounded-md shadow-md"
                    />
                  </div>
                )}

                {/* 本編動画 */}
                {post.main_video_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">本編動画</p>
                    <video
                      ref={mainVideoRef}
                      controls
                      className="w-full rounded-md shadow-md"
                    />
                  </div>
                )}
              </div>
            ) : (
              // 画像投稿の場合: 2列グリッド表示
              <div className="grid grid-cols-2 gap-4">
                {/* サムネイル画像 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">サムネイル画像</p>
                  <div className="relative">
                    <img
                      src={post.thumbnail_url || '/assets/no-image.svg'}
                      alt="サムネイル"
                      className="w-full aspect-square object-cover rounded cursor-pointer"
                      onClick={() => handleImageClick(0)}
                    />
                    <button
                      onClick={() => handleImageClick(0)}
                      className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs py-1 rounded hover:bg-opacity-80 transition-opacity"
                    >
                      画像を拡大
                    </button>
                  </div>
                </div>

                {/* 本編画像 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">本編画像</p>
                  <div className="relative">
                    <img
                      src={post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : post.thumbnail_url || '/assets/no-image.svg'}
                      alt="本編"
                      className="w-full aspect-square object-cover rounded cursor-pointer"
                      onClick={() => handleImageClick(0)}
                    />
                    <button
                      onClick={() => handleImageClick(0)}
                      className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs py-1 rounded hover:bg-opacity-80 transition-opacity"
                    >
                      画像詳細
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* タイトル */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">タイトル</p>
              <div className="p-3 border border-gray-300 rounded bg-white">
                <p className="text-sm text-gray-900">{post.description}</p>
              </div>
            </div>

            {/* 概要 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">概要</p>
              <div className="p-3 border border-gray-300 rounded bg-white">
                <p className="text-sm text-gray-900">{post.description}</p>
              </div>
            </div>
          </div>

          {/* 単品販売の価格 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-bold text-gray-900">単品販売の価格</span>
            <div className="flex items-center gap-1">
              <span className="text-primary text-lg">●</span>
              <span className="text-lg font-bold text-gray-900">{post.price}</span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleEdit}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg text-sm font-medium transition-colors"
            >
              編集する
            </button>

            {post.status === 5 && (
              <button
                onClick={() => setShowUnpublishDialog(true)}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 rounded-lg text-sm font-medium border border-gray-300 transition-colors"
              >
                非公開にする
              </button>
            )}

            <button
              onClick={() => navigate(-1)}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 rounded-lg text-sm font-medium border border-gray-300 transition-colors"
            >
              戻る
            </button>
          </div>

          {/* 投稿を削除 */}
          {post.status !== 4 && (
            <div className="text-center pt-4">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors"
              >
                投稿を削除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 非公開確認ダイアログ */}
      <Dialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>投稿を非公開にしますか？</DialogTitle>
            <DialogDescription>
              この投稿を非公開にします。後で再度公開することができます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnpublishDialog(false)}
              disabled={actionLoading}
            >
              キャンセル
            </Button>
            <Button onClick={handleUnpublish} disabled={actionLoading}>
              {actionLoading ? '処理中...' : '非公開にする'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
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

      {/* 画像ギャラリーモーダル */}
      {showImageGallery && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <button
            onClick={() => setShowImageGallery(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* 画像番号 */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-bold z-10">
              {currentImageIndex + 1}
            </div>

            {/* 前の画像ボタン */}
            {mediaUrls.length > 1 && (
              <button
                onClick={handlePreviousImage}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
              >
                <ChevronLeft className="w-12 h-12" />
              </button>
            )}

            {/* 画像表示 */}
            <img
              src={mediaUrls[currentImageIndex]}
              alt={`画像 ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* 次の画像ボタン */}
            {mediaUrls.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
              >
                <ChevronRight className="w-12 h-12" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 動画プレイヤーモーダル */}
      {showVideoPlayer && currentVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => {
              setShowVideoPlayer(false);
              setCurrentVideoUrl(null);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="w-full h-full flex items-center justify-center p-4">
            <video
              ref={videoRef}
              controls
              className="max-w-full max-h-full"
            >
              お使いのブラウザは動画タグをサポートしていません。
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
