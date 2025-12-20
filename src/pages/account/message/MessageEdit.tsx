import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AccountHeader from '@/features/account/components/AccountHeader';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getMyMessageAssetDetail, resubmitMessageAsset } from '@/api/endpoints/message_assets';
// import { getPresignedUrl } from '@/api/endpoints/message';
import { UserMessageAssetDetailResponse } from '@/api/types/message_asset';
import { ImageIcon, VideoIcon, Upload } from 'lucide-react';
import axios from 'axios';

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルタイプチェック
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('画像または動画ファイルを選択してください');
      return;
    }

    // ファイルサイズチェック（100MB）
    if (file.size > 100 * 1024 * 1024) {
      alert('ファイルサイズは100MB以下にしてください');
      return;
    }

    setSelectedFile(file);

    // プレビュー作成
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
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
      // 1. Presigned URL取得
      const fileExtension = selectedFile.name.split('.').pop() || '';
      const assetType = selectedFile.type.startsWith('image/') ? 1 : 2;

      // const presignedResponse = await getPresignedUrl({
      //   asset_type: assetType,
      //   content_type: selectedFile.type,
      //   file_extension: fileExtension,
      // });

      // const { storage_key, upload_url, required_headers } = presignedResponse.data;

      // 2. S3にアップロード
      // setUploadProgress(0);
      // await axios.put(upload_url, selectedFile, {
      //   headers: {
      //     'Content-Type': selectedFile.type,
      //     ...required_headers,
      //   },
      //   onUploadProgress: (progressEvent) => {
      //     const progress = progressEvent.total
      //       ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
      //       : 0;
      //     setUploadProgress(progress);
      //   },
      // });

      // // 3. 再申請API呼び出し
      // await resubmitMessageAsset(assetId, {
      //   message_text: messageText || undefined,
      //   asset_storage_key: storage_key,
      //   asset_type: assetType,
      // });

      alert('再申請が完了しました');
      navigate('/account/message');
    } catch (err: any) {
      console.error('Failed to resubmit:', err);
      if (err.response?.status === 400) {
        setError('再申請できないメッセージアセットです');
      } else {
        setError('再申請に失敗しました。もう一度お試しください。');
      }
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
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-red-500">*</span>
              新しい画像または動画
            </h3>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  クリックしてファイルを選択
                </p>
                <p className="text-xs text-gray-500">
                  画像または動画（最大100MB）
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-200 rounded-lg overflow-hidden">
                  {selectedFile?.type.startsWith('image/') ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
                  ) : (
                    <video src={previewUrl} controls className="w-full h-64" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {selectedFile?.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <VideoIcon className="w-4 h-4" />
                    )}
                    <span>{selectedFile?.name}</span>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    削除
                  </button>
                </div>
              </div>
            )}
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
