import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ErrorMessage } from '@/components/common';
import { UploadProgressModal } from '@/components/common/UploadProgressModal';
import {
  getBulkMessageRecipients,
  getBulkMessageUploadUrl,
  sendBulkMessage,
} from '@/api/endpoints/bulk_messages';
import {
  BulkMessageRecipientsResponse,
  PresignedUrlRequest,
  BulkMessageSendRequest,
} from '@/api/types/bulk_message';
import { putToPresignedUrl } from '@/service/s3FileUpload';
import { mimeToExt } from '@/lib/media';
import { convertLocalJSTToUTC } from '@/utils/convertDatetimeToLocalTimezone';
import { formatDateTime } from '@/lib/datetime';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { DatePickerWithPopover } from '@/components/common/DatePickerWithPopover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ファイル検証定数
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_MESSAGE_LENGTH = 1500;

export default function BulkSendMessage() {
  const navigate = useNavigate();

  // Recipients state
  const [recipients, setRecipients] = useState<BulkMessageRecipientsResponse | null>(null);
  const [sendToChipSenders, setSendToChipSenders] = useState(false);
  const [sendToSinglePurchasers, setSendToSinglePurchasers] = useState(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  // Message state
  const [messageText, setMessageText] = useState('');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Scheduled send state
  const [scheduled, setScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [formattedScheduledDateTime, setFormattedScheduledDateTime] = useState<string>('');

  // UI state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState({ show: false, messages: [] as string[] });
  const [uploadMessage, setUploadMessage] = useState('');

  // Fetch recipients on mount
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await getBulkMessageRecipients();
        setRecipients(response.data);
      } catch (err) {
        console.error('Failed to fetch recipients:', err);
        setError({ show: true, messages: ['送信先の取得に失敗しました'] });
      }
    };
    fetchRecipients();
  }, []);

  // Update scheduled datetime when date or time changes
  const updateScheduledDateTime = (date?: Date, time?: string) => {
    const currentDate = date || scheduledDate;
    const currentTime = time || scheduledTime;

    if (date) {
      setScheduledDate(date);
    }
    if (time !== undefined) {
      setScheduledTime(time);
    }

    if (currentDate && currentTime) {
      const formattedDateTime = formatDateTime(currentDate, currentTime);
      setFormattedScheduledDateTime(formattedDateTime);
    }
  };

  // Handle time selection (SettingsSection.tsxと同じ形式)
  const handleTimeSelection = (value: string, isHour: boolean) => {
    let finalTime: string;

    if (isHour) {
      const currentMinute = scheduledTime ? scheduledTime.split(':')[1] : '00';
      finalTime = `${value.padStart(2, '0')}:${currentMinute}`;
    } else {
      const currentHour = scheduledTime ? scheduledTime.split(':')[0] : '00';
      finalTime = `${currentHour}:${value.padStart(2, '0')}`;
    }

    updateScheduledDateTime(undefined, finalTime);
  };

  // Handle plan checkbox toggle
  const handlePlanToggle = (planId: string) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  };

  // File validation
  const validateFile = (file: File): string | null => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return '対応していないファイル形式です。JPEG、PNG、GIF、WebP、MP4、MOV、M4V のみアップロード可能です。';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'ファイルサイズは500MB以下にしてください';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setError({ show: false, messages: [] });

    const validationError = validateFile(file);
    if (validationError) {
      setError({ show: true, messages: [validationError] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Validation
  const validate = (): string[] => {
    const errors: string[] = [];

    if (!messageText.trim()) {
      errors.push('メッセージを入力してください');
    }

    if (messageText.length > MAX_MESSAGE_LENGTH) {
      errors.push(`メッセージは${MAX_MESSAGE_LENGTH}文字以内で入力してください`);
    }

    const hasRecipients =
      sendToChipSenders || sendToSinglePurchasers || selectedPlanIds.length > 0;
    if (!hasRecipients) {
      errors.push('送信先を1つ以上選択してください');
    }

    if (scheduled && !formattedScheduledDateTime) {
      errors.push('予約日時を設定してください');
    }

    if (scheduled && formattedScheduledDateTime) {
      const scheduledDateTime = new Date(formattedScheduledDateTime);
      if (scheduledDateTime < new Date()) {
        errors.push('過去の日時は設定できません');
      }
    }

    return errors;
  };

  // Handle send
  const handleSend = async () => {
    setError({ show: false, messages: [] });

    const errors = validate();
    if (errors.length > 0) {
      setError({ show: true, messages: errors });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let assetStorageKey: string | null = null;
      let assetType: number | null = null;

      // Upload file if present
      if (selectedFile) {
        setUploadMessage('ファイルをアップロード中...');
        setUploadProgress(10);

        const isImage = ALLOWED_IMAGE_TYPES.includes(selectedFile.type);
        assetType = isImage ? 1 : 2; // 1=画像, 2=動画
        const ext = mimeToExt(selectedFile.type);

        // Get presigned URL
        const presignedRequest: PresignedUrlRequest = {
          asset_type: assetType,
          content_type: selectedFile.type,
          file_extension: ext,
        };

        const presignedResponse = await getBulkMessageUploadUrl(presignedRequest);
        const { storage_key, upload_url, required_headers } = presignedResponse.data;

        setUploadProgress(30);
        setUploadMessage('アップロード中...');

        // Upload to S3
        await putToPresignedUrl(
          { key: storage_key, upload_url, expires_in: presignedResponse.data.expires_in, required_headers },
          selectedFile,
          required_headers,
          {
            onProgress: (pct) => {
              setUploadProgress(30 + (pct * 0.5)); // 30% to 80%
            },
          }
        );

        assetStorageKey = storage_key;
        setUploadProgress(80);
      }

      // Send bulk message
      setUploadMessage('メッセージを送信中...');
      // const sendRequest: BulkMessageSendRequest = {
      //   message_text: messageText,
      //   asset_storage_key: assetStorageKey,
      //   asset_type: assetType,
      //   send_to_chip_senders: sendToChipSenders,
      //   send_to_single_purchasers: sendToSinglePurchasers,
      //   send_to_plan_subscribers: selectedPlanIds,
      //   scheduled_at: scheduled && formattedScheduledDateTime
      //     ? convertLocalJSTToUTC(formattedScheduledDateTime, 'YYYY-MM-DD HH:mm:ss')
      //     ? convertLocalJSTToUTC(formattedScheduledDateTime)
      //     : null,
      // };

      // const sendResponse = await sendBulkMessage(sendRequest);
      setUploadProgress(100);

      // if (sendResponse.data.scheduled) {
      //   setUploadMessage('予約送信を設定しました');
      // } else {
      //   setUploadMessage(`${sendResponse.data.sent_count}件のメッセージを送信しました`);
      // }

      // Navigate after success
      setTimeout(() => {
        setUploading(false);
        navigate('/message');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to send bulk message:', err);

      const errorMessage = err?.response?.data?.detail || '送信に失敗しました';
      setError({ show: true, messages: [errorMessage] });
      setUploading(false);
      setUploadMessage('');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Auto-navigate after error
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  };

  const totalRecipients =
    (sendToChipSenders ? recipients?.chip_senders_count || 0 : 0) +
    (sendToSinglePurchasers ? recipients?.single_purchasers_count || 0 : 0) +
    (selectedPlanIds.length > 0
      ? recipients?.plan_subscribers
          .filter((plan) => selectedPlanIds.includes(plan.plan_id))
          .reduce((sum, plan) => sum + plan.subscribers_count, 0) || 0
      : 0);

  return (
    <CommonLayout header={true}>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200 w-full fixed top-0 left-0 right-0 bg-white z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="w-10 flex justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center w-full justify-center">
            <h1 className="text-xl font-semibold bg-white text-center">一斉送信</h1>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="pt-16 pb-20">
          {/* Error messages */}
          {error.show && error.messages.length > 0 && (
            <ErrorMessage
              message={error.messages}
              variant="error"
              onClose={() => setError({ show: false, messages: [] })}
            />
          )}

          {/* Message input */}
          <div className="p-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メッセージ <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="メッセージを入力してください"
              className="min-h-[120px] resize-none"
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {messageText.length} / {MAX_MESSAGE_LENGTH}
            </div>
          </div>

          {/* File upload */}
          <div className="p-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像・動画（任意）
            </label>

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                }`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  クリックまたはドラッグ&ドロップでアップロード
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG、PNG、GIF、WebP、MP4、MOV、M4V (最大500MB)
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(',')}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                {ALLOWED_IMAGE_TYPES.includes(selectedFile.type) ? (
                  <img src={previewUrl || ''} alt="Preview" className="w-full h-48 object-cover" />
                ) : (
                  <video src={previewUrl || ''} className="w-full h-48 object-cover" controls />
                )}
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Scheduled send toggle */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">予約送信</label>
              <button
                onClick={() => {
                  setScheduled(!scheduled);
                  if (scheduled) {
                    setScheduledDate(new Date());
                    setScheduledTime('');
                    setFormattedScheduledDateTime('');
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  scheduled ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    scheduled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {scheduled && (
              <div className="flex items-center space-x-2 w-full">
                {/* 日付入力欄：60% */}
                <DatePickerWithPopover
                  value={scheduledDate}
                  onChange={(date) => updateScheduledDateTime(date, scheduledTime)}
                  disabledBefore={false}
                  minDate={new Date()}
                />

                {/* 時間選択：40% */}
                <div className="flex items-center space-x-2 basis-2/5 flex-shrink-0">
                  <Select
                    value={scheduledTime ? parseInt(scheduledTime.split(':')[0], 10).toString() : undefined}
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
                    value={scheduledTime ? parseInt(scheduledTime.split(':')[1], 10).toString() : undefined}
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
            )}
          </div>

          {/* Recipients selection */}
          <div className="p-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              送信先 <span className="text-red-500">*</span>
            </label>

            <div className="space-y-3">
              {/* Chip senders */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={sendToChipSenders}
                    onCheckedChange={(checked) => setSendToChipSenders(!!checked)}
                  />
                  <span className="text-sm">チップを送ってくれたユーザー</span>
                </div>
                <span className="text-sm text-gray-600">
                  {recipients?.chip_senders_count || 0}人
                </span>
              </div>

              {/* Single purchasers */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={sendToSinglePurchasers}
                    onCheckedChange={(checked) => setSendToSinglePurchasers(!!checked)}
                  />
                  <span className="text-sm">単品販売購入ユーザー</span>
                </div>
                <span className="text-sm text-gray-600">
                  {recipients?.single_purchasers_count || 0}人
                </span>
              </div>

              {/* Plan subscribers */}
              {recipients?.plan_subscribers && recipients.plan_subscribers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">プラン加入者</p>
                  {recipients.plan_subscribers.map((plan) => (
                    <div
                      key={plan.plan_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedPlanIds.includes(plan.plan_id)}
                          onCheckedChange={() => handlePlanToggle(plan.plan_id)}
                        />
                        <span className="text-sm">{plan.plan_name}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {plan.subscribers_count}人
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total recipients */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">送信先合計</span>
                <span className="text-sm font-semibold text-primary">
                  {totalRecipients}人
                </span>
              </div>
            </div>
          </div>

          {/* Send button */}
          <div className="p-4">
            <Button
              onClick={handleSend}
              disabled={uploading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-full"
            >
              {uploading ? '送信中...' : scheduled ? '予約送信する' : '送信する'}
            </Button>
          </div>
        </div>

        {/* Upload progress modal */}
        <UploadProgressModal
          isOpen={uploading}
          progress={uploadProgress}
          title={scheduled ? '予約設定中' : '送信中'}
          message={uploadMessage || '処理中...'}
        />

        <BottomNavigation />
      </div>
    </CommonLayout>
  );
}
