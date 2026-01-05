import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AccountHeader from '@/features/account/components/AccountHeader';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import {
  getMyMessageAssetDetail,
  resubmitMessageAsset,
  getMessageAssetUploadUrlByGroupBy,
} from '@/api/endpoints/message_assets';
import { UserMessageAssetDetailResponse } from '@/api/types/message_asset';
import { Upload, X, Clock } from 'lucide-react';
import { putToPresignedUrl } from '@/service/s3FileUpload';
import CustomVideoPlayer from '@/features/shareVideo/componets/CustomVideoPlayer';
import { DatePickerWithPopover } from '@/components/common/DatePickerWithPopover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NG_WORDS } from '@/constants/ng_word';
import { ErrorMessage } from '@/components/common';

const MESSAGE_TYPE = {
  DM: 1,
  GROUP: 3,
} as const;

const MESSAGE_TYPE_LABELS: Record<number, string> = {
  [MESSAGE_TYPE.DM]: 'DM',
  [MESSAGE_TYPE.GROUP]: '一斉送信',
} as const;

const MESSAGE_TYPE_COLORS: Record<number, string> = {
  [MESSAGE_TYPE.DM]: 'bg-blue-100 text-blue-800',
  [MESSAGE_TYPE.GROUP]: 'bg-green-100 text-green-800',
} as const;

export default function MessageEdit() {
  const { groupBy } = useParams<{ groupBy: string }>();
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
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 予約送信関連のstate
  const [isReserved, setIsReserved] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState<string>('');

  // NGワードチェック
  const detectedNgWords = useMemo(() => {
    if (!messageText) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (messageText.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [messageText]);

  // 入力に合わせてテキストエリアの高さを自動調整
  useEffect(() => {
    if (messageTextareaRef.current) {
      // 高さをリセット
      messageTextareaRef.current.style.height = 'auto';
      // スクロール高さに合わせて調整
      messageTextareaRef.current.style.height = `${messageTextareaRef.current.scrollHeight}px`;
      // スクロールが必要な場合はスクロールバーを表示
      messageTextareaRef.current.style.overflowY =
        messageTextareaRef.current.scrollHeight > messageTextareaRef.current.clientHeight
          ? 'auto'
          : 'hidden';
    }
  }, [messageText]);

  useEffect(() => {
    if (!groupBy) {
      setError('アセットIDが指定されていません');
      setIsLoading(false);
      return;
    }

    const fetchAssetDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMyMessageAssetDetail(groupBy);
        const assetData = response.data;

        // 拒否（status === 2）または予約中（message_status === 2）の場合のみ編集可能
        const isRejected = assetData.status === 2;
        const isReserved = assetData.message_status === 2;

        if (!isRejected && !isReserved) {
          setError('このメッセージアセットは編集できません');
          setIsLoading(false);
          return;
        }

        setAsset(assetData);
        setMessageText(assetData.message_text || '');
        // 初期表示時に既存の画像/動画をプレビューにセット（cdn_urlがある場合のみ）
        if (assetData.cdn_url) {
          setPreviewUrl(assetData.cdn_url);
        }

        // 予約送信の場合、scheduled_atから日付と時間を初期化（UTCからJSTに変換）
        if (assetData.scheduled_at) {
          setIsReserved(true);
          // UTCタイムスタンプをJSTのDateオブジェクトに変換（9時間を足す）
          const utcDate = new Date(assetData.scheduled_at);
          const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

          // DatePickerには日付部分のみを設定（時刻を00:00:00にリセット）
          const dateOnly = new Date(jstDate.getFullYear(), jstDate.getMonth(), jstDate.getDate());
          setScheduledDate(dateOnly);

          // 時刻は別途管理（JSTの時刻を取得）
          const hours = jstDate.getHours().toString();
          const minutes = jstDate.getMinutes().toString();
          setScheduledTime(`${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`);
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
  }, [groupBy]);

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

  // 既存画像を削除してテキストのみにする
  const handleRemoveExistingFile = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 時間選択ハンドラー（BulkSendMessage.tsxから参考）
  const handleTimeSelection = (value: string, isHour: boolean) => {
    if (isHour) {
      const minutes = scheduledTime.split(':')[1] || '00';
      setScheduledTime(`${value.padStart(2, '0')}:${minutes}`);
    } else {
      const hours = scheduledTime.split(':')[0] || '00';
      setScheduledTime(`${hours}:${value.padStart(2, '0')}`);
    }
  };

  const handleSubmit = async () => {
    if (!asset || !groupBy) {
      alert('アセット情報が取得できていません');
      return;
    }

    // 拒否の場合は必須、予約中の場合は任意
    if (asset.status === 2 && !selectedFile && !previewUrl) {
      alert('画像または動画を選択してください');
      return;
    }

    // 予約送信の場合、日時の検証
    if (isReserved && (!scheduledDate || !scheduledTime)) {
      alert('予約日時を設定してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let assetStorageKey: string | undefined | null;
      let assetType: number | undefined | null;

      // 画像の変更があった場合のみアップロード処理
      // selectedFileが存在し、かつpreviewUrlが既存のcdn_urlと異なる場合（新しいファイルが選択された場合）のみアップロード
      const isNewFileSelected = !!(selectedFile && previewUrl && previewUrl !== asset.cdn_url);
      const isFileRemoved = !selectedFile && !previewUrl && !!asset.cdn_url;

      if (isNewFileSelected) {
        // 1. ファイル情報取得
        const fileExtension = selectedFile.name.split('.').pop() || '';
        assetType = selectedFile.type.startsWith('image/') ? 1 : 2;

        // 2. Presigned URL取得（group_byを使用）
        const uploadUrlResponse = await getMessageAssetUploadUrlByGroupBy(groupBy, {
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

        assetStorageKey = uploadUrlResponse.data.storage_key;
      } else if (isFileRemoved) {
        // 既存画像を削除した場合（テキストのみに変更）
        assetStorageKey = null;
        assetType = null;
      }

      // 予約日時の処理（JSTをUTCに変換）
      let scheduledAtISO: string | null = null;
      if (isReserved && scheduledDate && scheduledTime) {
        const [hours, minutes] = scheduledTime.split(':').map(Number);

        // scheduledDateから年月日を取得
        const year = scheduledDate.getFullYear();
        const month = scheduledDate.getMonth();
        const day = scheduledDate.getDate();

        // JSTでの日時を構築
        const jstDate = new Date(year, month, day, hours, minutes, 0, 0);

        // toISOString()は自動的にUTCに変換される
        scheduledAtISO = jstDate.toISOString();
      }

      // 4. 再申請API呼び出し（group_byで同じグループの全アセットを一括更新）
      const requestData = {
        message_text: messageText || undefined,
        asset_storage_key: assetStorageKey,
        asset_type: assetType,
        scheduled_at: scheduledAtISO || undefined,
        is_new_file_selected: isNewFileSelected ?? false,
      };

      await resubmitMessageAsset(groupBy, requestData);

      navigate('/account/message');
    } catch (err: any) {
      console.error('Failed to resubmit:', err);
      const isRejected = asset.status === 2;
      let errorMessage = isRejected
        ? '再申請に失敗しました。もう一度お試しください。'
        : '更新に失敗しました。もう一度お試しください。';

      if (err.response?.status === 400) {
        errorMessage = isRejected
          ? '再申請できないメッセージアセットです'
          : '更新できないメッセージアセットです';
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
          <AccountHeader
            title="メッセージ編集"
            showBackButton
            onBack={() => navigate(`/account/message/${groupBy}`)}
          />
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
          <AccountHeader
            title="メッセージ編集"
            showBackButton
            onBack={() => {
              // 拒否投稿の場合のみ拒否リストに遷移
              if (asset?.status === 2) {
                navigate('/account/message?status=rejected&page=1');
              } else {
                navigate(`/account/message/${groupBy}`);
              }
            }}
          />
        </div>

        <div className="pt-16 px-4 space-y-6">
          <div className="pt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              {asset.status === 2 ? '拒否されたメッセージの再申請' : '予約メッセージの編集'}
            </h2>
            <p className="text-sm text-gray-600">
              {asset.status === 2
                ? '以下の内容を修正して再度申請してください。'
                : '予約送信の内容を編集できます。'}
            </p>
          </div>

          {/* 拒否理由（拒否の場合のみ表示） */}
          {asset.status === 2 && asset.reject_comments && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">拒否理由</h3>
              <p className="text-red-900 whitespace-pre-wrap break-words">
                {asset.reject_comments}
              </p>
            </div>
          )}

          {/* 送信先情報 */}
          {asset.type === MESSAGE_TYPE.DM && (
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
          )}
          {/* メッセージテキスト編集 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">メッセージ内容</h3>
            <textarea
              ref={messageTextareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="メッセージを入力してください..."
              className={`w-full min-h-[100px] p-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                detectedNgWords.length > 0
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary'
              }`}
              maxLength={1000}
            />
            {detectedNgWords.length > 0 && (
              <div className="mt-2">
                <ErrorMessage
                  message={[
                    `NGワードが検出されました: ${detectedNgWords.join('、')}`,
                    `検出されたNGワード数: ${detectedNgWords.length}個`,
                  ]}
                  variant="error"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 text-right">{messageText.length} / 1000</p>
          </div>

          {/* ファイルアップロード */}
          <div
            className="bg-gray-50 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              {asset.status === 2 && <span className="text-red-500">*</span>}
              {asset.status === 2 ? '画像・動画を入れ替え' : '画像・動画を追加'}
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
                <div
                  className={`relative border-2 border-gray-300 rounded-lg overflow-auto bg-gray-200 flex items-center justify-center ${selectedFile.type.startsWith('image/') ? 'min-h-[256px]' : 'min-h-[70vh]'}`}
                >
                  {selectedFile.type.startsWith('image/') ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <video src={previewUrl} controls className="max-w-full max-h-full" />
                  )}
                  <button
                    onClick={handleCancelFile}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedFile.type.startsWith('image/') ? '画像' : '動画'} •{' '}
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : previewUrl && asset.asset_type ? (
              /* 既存ファイルのプレビュー */
              <div className="space-y-3">
                <div
                  className={`relative border-2 border-gray-300 rounded-lg overflow-auto bg-gray-200 flex items-center justify-center ${asset.asset_type === 1 ? 'min-h-[256px]' : 'min-h-[70vh]'}`}
                >
                  {asset.asset_type === 1 ? (
                    <img
                      src={previewUrl}
                      alt="Current asset"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <CustomVideoPlayer videoUrl={previewUrl} className="max-w-full max-h-full" />
                  )}
                  <button
                    onClick={handleRemoveExistingFile}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition z-10"
                    title="画像を削除"
                  >
                    <X className="w-5 h-5" />
                  </button>
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
                  <span className="text-xs text-gray-500">
                    画像（JPEG, PNG, GIF, WebP）または動画（MP4, MOV）
                  </span>
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

          {/* 予約送信設定（予約送信メッセージの場合のみ表示） */}
          {isReserved && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-medium text-gray-700">予約送信設定</h3>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full">
                {/* 日付入力欄 */}
                <DatePickerWithPopover
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  disabledBefore={false}
                  minDate={new Date()}
                />

                {/* 時間選択 */}
                <div className="flex items-center space-x-2 basis-2/5 flex-shrink-0">
                  <Select
                    value={
                      scheduledTime
                        ? parseInt(scheduledTime.split(':')[0], 10).toString()
                        : undefined
                    }
                    onValueChange={(value) => handleTimeSelection(value, true)}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="時" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm font-medium font-bold">時</span>

                  <Select
                    value={
                      scheduledTime
                        ? parseInt(scheduledTime.split(':')[1], 10).toString()
                        : undefined
                    }
                    onValueChange={(value) => handleTimeSelection(value, false)}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="分" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm font-medium font-bold">分</span>
                </div>
              </div>
            </div>
          )}

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
              disabled={isSubmitting || (asset.status === 2 && !selectedFile)}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? asset.status === 2
                  ? '再申請中...'
                  : '更新中...'
                : asset.status === 2
                  ? '再申請する'
                  : '更新する'}
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
