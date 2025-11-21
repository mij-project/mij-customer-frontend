import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { getAccountPostDetail, updateAccountPost } from '@/api/endpoints/account';
import { AccountPostDetailResponse, AccountMediaAsset } from '@/api/types/account';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { POST_STATUS, MEDIA_ASSET_KIND, MEDIA_ASSET_STATUS } from '@/constants/constants';
import CustomVideoPlayer from '@/features/shareVideo/componets/CustomVideoPlayer';
import { checkVideoConversionStatus } from '@/api/endpoints/postMedia';

// media_assetsからkindでフィルタして取得するヘルパー関数
const getMediaAssetByKind = (
  mediaAssets: Record<string, AccountMediaAsset>,
  kind: number
): AccountMediaAsset | null => {
  const entry = Object.entries(mediaAssets).find(([_, asset]) => asset.kind === kind);
  return entry ? entry[1] : null;
};

// media_assetsから特定kindのすべてを取得
const getMediaAssetsByKind = (
  mediaAssets: Record<string, AccountMediaAsset>,
  kind: number
): AccountMediaAsset[] => {
  return Object.values(mediaAssets).filter((asset) => asset.kind === kind);
};

export default function AccountPostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<AccountPostDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [isCheckingConversion, setIsCheckingConversion] = useState(false);

  // media_assetsから情報を抽出
  const thumbnailAsset = post
    ? getMediaAssetByKind(post.media_assets, MEDIA_ASSET_KIND.THUMBNAIL)
    : null;
  const ogpAsset = post ? getMediaAssetByKind(post.media_assets, MEDIA_ASSET_KIND.OGP) : null;
  const mainVideoAsset = post
    ? getMediaAssetByKind(post.media_assets, MEDIA_ASSET_KIND.MAIN_VIDEO)
    : null;
  const sampleVideoAsset = post
    ? getMediaAssetByKind(post.media_assets, MEDIA_ASSET_KIND.SAMPLE_VIDEO)
    : null;
  const imageAssets = post ? getMediaAssetsByKind(post.media_assets, MEDIA_ASSET_KIND.IMAGES) : [];

  const thumbnailUrl = thumbnailAsset?.storage_key || '/assets/no-image.svg';

  const galleryImages = useMemo(() => {
    const urls: string[] = [];
    const pushUrl = (url?: string | null) => {
      if (url) {
        urls.push(url);
      }
    };

    if (post?.is_video) {
      pushUrl(thumbnailAsset?.storage_key);
      pushUrl(ogpAsset?.storage_key);
    } else {
      pushUrl(thumbnailAsset?.storage_key);
      imageAssets.forEach((asset) => pushUrl(asset.storage_key));
      pushUrl(ogpAsset?.storage_key);
    }

    if (urls.length === 0) {
      urls.push('/assets/no-image.svg');
    }

    return urls;
  }, [post?.is_video, thumbnailAsset?.storage_key, ogpAsset?.storage_key, imageAssets]);

  useEffect(() => {
    if (postId) {
      fetchPostDetail();
    }
  }, [postId]);

  // 動画変換状態をチェック
  const checkConversionStatus = async () => {
    if (!postId) return;

    try {
      setIsCheckingConversion(true);
      const status = await checkVideoConversionStatus(postId);

      if (status.is_converting) {
        setShowConversionModal(true);
      } else {
        setShowConversionModal(false);
      }
    } catch (error) {
      console.error('動画変換状態チェックエラー:', error);
      // エラー時はモーダルを表示しない
      setShowConversionModal(false);
    } finally {
      setIsCheckingConversion(false);
    }
  };

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const data = await getAccountPostDetail(postId!);
      setPost(data);

      // 動画投稿の場合は変換状態をチェック
      if (data.is_video) {
        // postIdを直接渡す
        try {
          setIsCheckingConversion(true);
          const status = await checkVideoConversionStatus(postId!);

          if (status.is_converting) {
            setShowConversionModal(true);
          } else {
            setShowConversionModal(false);
          }
        } catch (error) {
          console.error('動画変換状態チェックエラー:', error);
          setShowConversionModal(false);
        } finally {
          setIsCheckingConversion(false);
        }
      }
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
      await updateAccountPost(postId!, { status: POST_STATUS.UNPUBLISHED });
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

  const handlePublish = async () => {
    try {
      setActionLoading(true);
      await updateAccountPost(postId!, { status: POST_STATUS.APPROVED });
      alert('投稿を公開しました');
      navigate('/account/post');
    } catch (error) {
      console.error('公開に失敗しました:', error);
      alert('公開に失敗しました');
    } finally {
      setActionLoading(false);
      setShowPublishDialog(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await updateAccountPost(postId!, { status: POST_STATUS.DELETED });
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
    if (galleryImages.length === 0) return;
    const safeIndex =
      ((index % galleryImages.length) + galleryImages.length) % galleryImages.length;
    setCurrentImageIndex(safeIndex);
    setShowImageGallery(true);
  };

  const openImageModal = (targetUrl?: string | null) => {
    if (!targetUrl || galleryImages.length === 0) return;
    const targetIndex = galleryImages.findIndex((url) => url === targetUrl);
    handleImageClick(targetIndex !== -1 ? targetIndex : 0);
  };

  const handleVideoClick = (videoUrl: string | null) => {
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl);
      setShowVideoPlayer(true);
    }
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      galleryImages.length === 0 ? prev : prev > 0 ? prev - 1 : galleryImages.length - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      galleryImages.length === 0 ? prev : prev < galleryImages.length - 1 ? prev + 1 : 0
    );
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case POST_STATUS.PENDING:
        return '審査中';
      case POST_STATUS.REJECTED:
        return '要修正';
      case POST_STATUS.UNPUBLISHED:
        return '非公開';
      case POST_STATUS.DELETED:
        return '削除済み';
      case POST_STATUS.APPROVED:
        return '公開中';
      case POST_STATUS.RESUBMIT:
        return '再申請';
      default:
        return '不明';
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
              src={thumbnailAsset?.storage_key || '/assets/no-image.svg'}
              alt={post.description}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <h2 className="text-base font-medium text-gray-900">{post.description}</h2>
            </div>
          </div>

          {/* 審査ステータス */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">審査ステータス</h3>
              <span
                className={`px-2 py-0.5 text-xs rounded ${
                  post.status === POST_STATUS.REJECTED
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
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
            {post.status === POST_STATUS.APPROVED && (
              <p className="text-sm text-gray-600">この投稿は無期限で公開中です</p>
            )}
            {sampleVideoAsset?.reject_comments && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">サンプル動画却下理由</p>
                  <p className="text-sm text-yellow-800">{sampleVideoAsset.reject_comments}</p>
                </div>
              </div>
            )}
            {mainVideoAsset?.reject_comments && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">本編動画却下理由</p>
                  <p className="text-sm text-yellow-800">{mainVideoAsset.reject_comments}</p>
                </div>
              </div>
            )}
            {ogpAsset?.reject_comments && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">OGP画像却下理由</p>
                  <p className="text-sm text-yellow-800">{ogpAsset.reject_comments}</p>
                </div>
              </div>
            )}
            {imageAssets.some((asset) => asset.reject_comments) && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">画像却下理由</p>
                  <div className="space-y-2">
                    {imageAssets
                      .filter((asset) => asset.reject_comments)
                      .map((asset, index) => (
                        <p key={index} className="text-sm text-yellow-800">
                          {asset.reject_comments}
                        </p>
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
                <div className="grid grid-cols-2 gap-4">
                  {/* サムネイル画像 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">サムネイル画像</p>
                    <div className="relative">
                      <img
                        src={thumbnailUrl}
                        alt="サムネイル"
                        className="w-full aspect-video object-cover rounded cursor-pointer"
                        onClick={() => openImageModal(thumbnailUrl)}
                      />
                      <button
                        onClick={() => openImageModal(thumbnailUrl)}
                        className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs py-1 rounded hover:bg-opacity-80 transition-opacity"
                      >
                        画像を拡大
                      </button>
                    </div>
                  </div>

                  {/* OGP画像 */}
                  {ogpAsset?.storage_key && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">OGP画像</p>
                      <div className="relative">
                        <img
                          src={ogpAsset.storage_key}
                          alt="OGP"
                          className="w-full aspect-video object-cover rounded cursor-pointer"
                          onClick={() => openImageModal(ogpAsset.storage_key)}
                        />
                        <button
                          onClick={() => openImageModal(ogpAsset.storage_key)}
                          className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs py-1 rounded hover:bg-opacity-80 transition-opacity"
                        >
                          画像を拡大
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* サンプル動画 */}
                {sampleVideoAsset?.storage_key && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">サンプル動画</p>
                    <div className="w-full h-[300px] bg-black rounded-md shadow-md">
                      <CustomVideoPlayer
                        videoUrl={sampleVideoAsset.storage_key}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {/* 本編動画 */}
                {mainVideoAsset?.storage_key && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">本編動画</p>
                    <div className="w-full h-[300px] bg-black rounded-md shadow-md">
                      <CustomVideoPlayer
                        videoUrl={mainVideoAsset.storage_key}
                        className="w-full h-full"
                      />
                    </div>
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
                      src={thumbnailUrl}
                      alt="サムネイル"
                      className="w-full aspect-square object-cover rounded cursor-pointer"
                      onClick={() => openImageModal(thumbnailUrl)}
                    />
                    <button
                      onClick={() => openImageModal(thumbnailUrl)}
                      className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs py-1 rounded hover:bg-opacity-80 transition-opacity"
                    >
                      画像を拡大
                    </button>
                  </div>
                </div>

                {/* OGP画像 */}
                {ogpAsset?.storage_key && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">OGP画像</p>
                    <div className="relative">
                      <img
                        src={ogpAsset.storage_key}
                        alt="OGP"
                        className="w-full aspect-square object-cover rounded cursor-pointer"
                        onClick={() => openImageModal(ogpAsset.storage_key)}
                      />
                      <button
                        onClick={() => openImageModal(ogpAsset.storage_key)}
                        className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs py-1 rounded hover:bg-opacity-80 transition-opacity"
                      >
                        画像を拡大
                      </button>
                    </div>
                  </div>
                )}

                {/* 本編画像 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">本編画像</p>
                  <div className="relative">
                    <img
                      src={
                        imageAssets.length > 0
                          ? imageAssets[0].storage_key || '/assets/no-image.svg'
                          : thumbnailAsset?.storage_key || '/assets/no-image.svg'
                      }
                      alt="本編"
                      className="w-full aspect-square object-cover rounded cursor-pointer"
                      onClick={() =>
                        openImageModal(
                          imageAssets.length > 0
                            ? imageAssets[0].storage_key || undefined
                            : thumbnailAsset?.storage_key || '/assets/no-image.svg'
                        )
                      }
                    />
                    <button
                      onClick={() =>
                        openImageModal(
                          imageAssets.length > 0
                            ? imageAssets[0].storage_key || undefined
                            : thumbnailAsset?.storage_key || '/assets/no-image.svg'
                        )
                      }
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

            {post.status === POST_STATUS.APPROVED && (
              <button
                onClick={() => setShowUnpublishDialog(true)}
                className="w-full bg-yellow-200 hover:bg-yellow-300 text-gray-900 py-3 rounded-lg text-sm font-medium border border-gray-300 transition-colors"
              >
                非公開にする
              </button>
            )}

            {post.status === POST_STATUS.UNPUBLISHED && (
              <button
                onClick={() => setShowPublishDialog(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg text-sm font-medium transition-colors"
              >
                公開する
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
          {post.status !== POST_STATUS.DELETED && (
            <div className="text-center">
              <Button
                onClick={() => setShowDeleteDialog(true)}
                className="text-white w-full bg-red-500 hover:bg-red-600 text-sm font-medium transition-colors"
              >
                投稿を削除
              </Button>
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

      {/* 公開確認ダイアログ */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>投稿を公開しますか？</DialogTitle>
            <DialogDescription>
              この投稿を公開します。公開後、すべてのユーザーがこの投稿を閲覧できるようになります。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPublishDialog(false)}
              disabled={actionLoading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handlePublish}
              disabled={actionLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {actionLoading ? '処理中...' : '公開する'}
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
            {galleryImages.length > 1 && (
              <button
                onClick={handlePreviousImage}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
              >
                <ChevronLeft className="w-12 h-12" />
              </button>
            )}

            {/* 画像表示 */}
            {galleryImages[currentImageIndex] && (
              <img
                src={galleryImages[currentImageIndex]}
                alt={`画像 ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* 次の画像ボタン */}
            {galleryImages.length > 1 && (
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
            <div className="max-w-full max-h-full w-full h-full">
              <CustomVideoPlayer videoUrl={currentVideoUrl} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}

      {/* 動画変換中モーダル */}
      <Dialog open={showConversionModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              変換処理中
            </DialogTitle>
            <DialogDescription className="pt-4">
              動画の変換処理が行われています。
              <br />
              しばらくお待ちください。
              <br />
              <br />
              変換が完了するまで、この投稿の操作はできません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => navigate('/account/post')}
              variant="outline"
              className="w-full"
            >
              投稿一覧に戻る
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
