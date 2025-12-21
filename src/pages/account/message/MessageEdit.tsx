import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AccountHeader from '@/features/account/components/AccountHeader';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getMyMessageAssetDetail, resubmitMessageAsset } from '@/api/endpoints/message_assets';
import {
  getMessageAssetUploadUrl
} from '@/api/endpoints/conversation';
import { UserMessageAssetDetailResponse } from '@/api/types/message_asset';
import { Upload, X } from 'lucide-react';
import { putToPresignedUrl } from '@/service/s3FileUpload';
import CustomVideoPlayer from '@/features/shareVideo/componets/CustomVideoPlayer';

export default function MessageEdit() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<UserMessageAssetDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!assetId) {
      setError('アセットIDが指定されていません');
      setIsLoading(false);
      return;
    }

    const fetchAssetDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMyMessageAssetDetail(assetId);
        const assetData = response.data;

        // ステータスが拒否（2）でない場合はエラー
        if (assetData.status !== 2) {
          setError('このメッセージアセットは編集できません');
          setIsLoading(false);
          return;
        }

        setAsset(assetData);
        setMessageText(assetData.message_text || '');
        // 初期表示時に既存の画像/動画をプレビューにセット
        if (assetData.cdn_url) {
          setPreviewUrl(assetData.cdn_url);
        }
      } catch (err: any) {
        console.error('Failed to fetch asset detail:', err);
        if (err.response?.status === 404) {
          setError('メッセージアセットが見つかりません');
        } else if (err.response?.status === 403) {
          setError('このメッセージにアクセスする権限がありません');
        } else {
          setError('メッセージアセットの取得に失敗しました');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssetDetail();
  }, [assetId]);

  const handleFileSelect = (file: File) => {
    // ファイルタイプの検証（Conversation.tsxと同じ厳密なバリデーション）
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/quicktime'];

    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
      alert('画像（JPEG, PNG, GIF, WebP）または動画（MP4, MOV）のみアップロード可能です');
      return;
    }

    // ファイルサイズの検証（500MB）
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('ファイルサイズは500MB以下にしてください');
      return;
    }

    setSelectedFile(file);

    // プレビュー用のURLを生成
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!asset || !assetId) {
      alert('アセット情報が取得できていません');
      return;
    }

    if (!selectedFile) {
      alert('画像または動画を選択してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. ファイル情報取得
      const fileExtension = selectedFile.name.split('.').pop() || '';
      const assetType = selectedFile.type.startsWith('image/') ? 1 : 2;

      // 2. Presigned URL取得（conversation_idを使用）
      const uploadUrlResponse = await getMessageAssetUploadUrl(asset.conversation_id, {
        asset_type: assetType,
        content_type: selectedFile.type,
        file_extension: fileExtension,
      });

      // 3. S3にアップロード（プログレスバー付き）
      await putToPresignedUrl(
        {
          key: uploadUrlResponse.data.storage_key,
          upload_url: uploadUrlResponse.data.upload_url,
          expires_in: uploadUrlResponse.data.expires_in,
          required_headers: uploadUrlResponse.data.required_headers,
        },
        selectedFile,
        uploadUrlResponse.data.required_headers,
        {
          onProgress: (pct) => setUploadProgress(pct),
        }
      );

      // 4. 再申請API呼び出し
      await resubmitMessageAsset(assetId, {
        message_text: messageText || undefined,
        asset_storage_key: uploadUrlResponse.data.storage_key,
        asset_type: assetType,
      });

      navigate('/account/message');
    } catch (err: any) {
      console.error('Failed to resubmit:', err);
      let errorMessage = '再申請に失敗しました。もう一度お試しください。';

      if (err.response?.status === 400) {
        errorMessage = '再申請できないメッセージアセットです';
      } else if (err.response?.status === 403) {
        errorMessage = 'この操作を実行する権限がありません';
      } else if (err.message?.includes('S3 PUT failed')) {
        errorMessage = 'ファイルのアップロードに失敗しました';
      }

      setError(errorMessage);

      // エラー発生時は前の画面に戻る
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <CommonLayout header={true}>
        <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white">
          <AccountHeader title="メッセージ編集" showBackButton />
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </CommonLayout>
    );
  }

  if (error || !asset) {
    return (
      <CommonLayout header={true}>
        <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white">
          <AccountHeader title="メッセージ編集" showBackButton />
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-red-600 text-center mb-4">{error || 'データが見つかりません'}</p>
            <button
              onClick={() => navigate('/account/message')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout header={true}>
      <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white pb-20">
        <div className="fixed top-0 left-0 right-0 z-20 bg-white max-w-screen-md mx-auto">
          <AccountHeader title="メッセージ編集" showBackButton />
        </div>

        <div className="pt-16 px-4 space-y-6">
          <div className="pt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">拒否されたメッセージの再申請</h2>
            <p className="text-sm text-gray-600">
              以下の内容を修正して再度申請してください。
            </p>
          </div>

          {/* 拒否理由 */}
          {asset.reject_comments && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">拒否理由</h3>
              <p className="text-red-900 whitespace-pre-wrap break-words">
                {asset.reject_comments}
              </p>
            </div>
          )}

          {/* 送信先情報 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">送信先</h3>
            <div className="flex items-center gap-3">
              {asset.partner_avatar ? (
                <img
                  src={asset.partner_avatar}
                  alt={asset.partner_profile_name || ''}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  {asset.partner_profile_name?.[0] || '?'}
                </div>
              )}
              <div>
                <p className="font-medium">{asset.partner_profile_name || 'Unknown User'}</p>
                {asset.partner_username && (
                  <p className="text-sm text-gray-500">@{asset.partner_username}</p>
                )}
              </div>
            </div>
          </div>

          {/* メッセージテキスト編集 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">メッセージ内容</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="メッセージを入力してください..."
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {messageText.length} / 1000
            </p>
          </div>

          {/* ファイルアップロード */}
          <div
            className="bg-gray-50 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-red-500">*</span>
              画像・動画を入れ替え
            </h3>

            {/* ドラッグ&ドロップオーバーレイ */}
            {isDragOver && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
                <div className="text-primary font-semibold">ファイルをドロップ</div>
              </div>
            )}

            {/* ファイルプレビュー */}
            {selectedFile && previewUrl ? (
              <div className="space-y-3">
                <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-200">
                  {selectedFile.type.startsWith('image/') ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
                  ) : (
                    <video src={previewUrl} controls className="w-full h-64" />
                  )}
                  <button
                    onClick={handleCancelFile}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedFile.type.startsWith('image/') ? '画像' : '動画'} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : previewUrl ? (
              /* 既存ファイルのプレビュー */
              <div className="space-y-3">
                <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-200">
                  {asset.asset_type === 1 ? (
                    <img src={previewUrl} alt="Current asset" className="w-full h-64 object-cover" />
                  ) : (
                    <CustomVideoPlayer videoUrl={previewUrl} className="w-full h-64" />
                  )}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  現在のファイル（{asset.asset_type === 1 ? '画像' : '動画'}）
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  <Upload className="w-5 h-5" />
                  新しいファイルを選択
                </button>
              </div>
            ) : (
              /* ファイル未選択 */
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">クリックまたはドラッグ&ドロップ</span>
                  <span className="text-xs text-gray-500">画像（JPEG, PNG, GIF, WebP）または動画（MP4, MOV）</span>
                </button>
                <p className="text-xs text-gray-500 text-center">
                  最大500MBまでアップロード可能です
                </p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* アップロード進捗 */}
          {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">アップロード中...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}%</p>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="space-y-3 pb-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedFile}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '再申請中...' : '再申請する'}
            </button>
            <button
              onClick={() => navigate('/account/message')}
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </CommonLayout>
  );
}
