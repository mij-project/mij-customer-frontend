import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SubmissionStatus {
  status: number; // 1=pending, 2=approved, 3=rejected
  created_at: string;
  rejection_reason?: string | null;
}

interface ImageUploadTabProps {
  title: string;
  description: string;
  imageType: 'avatar' | 'cover';
  currentImage: string | null;
  file: File | null;
  progress: number;
  submitting: boolean;
  submissionStatus?: SubmissionStatus | null;
  onFileSelect: (file: File | null) => void;
  onSubmit: () => void;
  setErrors: (errors: { show: boolean; messages: string[] }) => void;
}

export default function ImageUploadTab({
  title,
  description,
  imageType,
  currentImage,
  file,
  progress,
  submitting,
  submissionStatus,
  onFileSelect,
  onSubmit,
  setErrors,
}: ImageUploadTabProps) {
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 申請中かどうかを判定
  const isPending = submissionStatus?.status === 1;
  const isRejected = submissionStatus?.status === 3;

  // ファイルが変更されたらプレビューURLを生成
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // クリーンアップ: メモリリーク防止
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPreviewUrl(currentImage);
    }
  }, [file, currentImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      // ファイルサイズチェック (10MB以下)
      if (selectedFile.size > 10 * 1024 * 1024) {
        // alert('ファイルサイズは10MB以下にしてください');
        setErrors({ show: true, messages: ['ファイルサイズは10MB以下にしてください'] });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // ファイル形式チェック
      if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
        // alert('JPEG/PNG形式の画像のみアップロード可能です');
        setErrors({ show: true, messages: ['JPEG/PNG形式の画像のみアップロード可能です'] });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      onFileSelect(selectedFile);
    }
  };

  const canSubmit = agreed1 && agreed2 && file !== null && !submitting && !isPending;

  return (
    <div className="space-y-6 pb-24">
      {/* 申請ステータス表示 */}
      {submissionStatus && (
        <div
          className={`p-4 rounded-lg flex items-start space-x-3 ${
            isPending ? 'bg-yellow-50' : isRejected ? 'bg-red-50' : 'bg-green-50'
          }`}
        >
          {isPending && (
            <>
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800">申請中</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  現在、画像の審査中です。審査完了までしばらくお待ちください。
                </p>
              </div>
            </>
          )}
          {isRejected && (
            <>
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">却下されました</h4>
                <p className="text-xs text-red-700 mt-1">
                  {submissionStatus.rejection_reason || '画像が却下されました。'}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  別の画像を選択して再度申請してください。
                </p>
              </div>
            </>
          )}
          {!isPending && !isRejected && (
            <>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800">承認済み</h4>
                <p className="text-xs text-green-700 mt-1">
                  画像が承認されてプロフィールに反映されました。
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* 説明セクション */}
      <div className="bg-pink-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">画像の表示箇所</h3>
        <p className="text-sm text-pink-600">{description}</p>
      </div>

      {/* 画像プレビュー */}
      <div className="relative">
        {imageType === 'avatar' ? (
          // アバター画像（円形）
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="プロフィール画像"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        ) : (
          // カバー画像（横長）
          <div className="relative w-full">
            <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="カバー画像" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 選択したファイル情報 */}
      {file && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700">選択中の画像</p>
          <p className="text-xs text-gray-600 mt-1">{file.name}</p>
          <p className="text-xs text-gray-600">サイズ: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      {/* アップロード進捗 */}
      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <p className="text-xs text-center text-gray-600 mt-1">アップロード中... {progress}%</p>
        </div>
      )}

      {progress === 100 && <p className="text-sm text-green-600 text-center">✓ アップロード完了</p>}

      {/* 注意書き */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>
          *
          設定すると審査対象となり、利用規約違反があった場合は、予告なくアカウントが凍結される可能性があります。
        </p>
      </div>

      {/* チェックボックス */}
      <div className="bg-pink-50 p-4 rounded-lg space-y-3">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed1}
            onChange={(e) => setAgreed1(e.target.checked)}
            className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
          />
          <span className="text-sm text-gray-700">
            投稿内容が著作権者の許諾をとらないまず本の内容に基づく場合は、予告なくアカウントが凍結される可能性があります。
          </span>
        </label>
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed2}
            onChange={(e) => setAgreed2(e.target.checked)}
            className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
          />
          <span className="text-sm text-gray-700">
            性器または性器入した性的コンテンツまたはサービスを宣伝しているか公表していることを確認した。
          </span>
        </label>
        <a href="#" className="text-sm text-primary hover:underline block">
          モモイクから受変もの
        </a>
      </div>

      {/* 申請ボタン */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '申請中...' : isPending ? '審査中です' : '申請する'}
        </Button>
        {isPending && (
          <p className="text-xs text-center text-yellow-700 mt-2">
            ※ 審査中のため、新たな申請はできません
          </p>
        )}
      </div>

      {/* 注意書き（下部） */}
      <div className="text-xs text-gray-500 space-y-2">
        <p>いつも安心安全なプラットフォームの運営にご協力ありがとうございます</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <a href="#" className="text-primary hover:underline">
              利用規約
            </a>
            に則りコンテンツの投稿をお願いしています。
          </li>
          <li>
            他人のコンテンツをアップロードする行為は著作権法の違反となり1000万円以下の罰金が課せられます。
          </li>
          <li>
            モザイク処理をおこなっていないコンテンツはわいせつ物頒布等に該当するとして刑法違反です。全ての投稿者が利用できない状態や捕まってしまう可能性があります。
          </li>
          <li>
            性器や性器周りのモザイク処理がおこなわれているか確認、全ての投稿者が利用できる状態を前提に削除せざるを得ないばあいがあります。
          </li>
        </ul>
        <p className="text-center mt-4">
          <a href="#" className="text-primary hover:underline">
            投稿前に読むべきガイドはこちら
          </a>
        </p>
      </div>
    </div>
  );
}
