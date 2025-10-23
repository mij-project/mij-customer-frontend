import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import { IdentityUploadedFile, IdentityPresignedUrlRequest } from '@/api/types/identity';
import { identityPresignedUrl, completeIdentityUpload } from '@/api/endpoints/identity';
import { putToPresignedUrl } from '@/service/s3FileUpload';
import { IdentityFileKind } from '@/constants/constants';
import { FileSpec } from '@/api/types/commons';
import Header from '@/components/common/Header';

const mimeToExt = (mime: string): FileSpec['ext'] => {
  if (mime === 'image/png') return 'png';
  if (mime === 'application/pdf') return 'pdf';
  return 'jpg' as FileSpec['ext'];
};

interface CreatorRequestCertifierImageProps {
  onNext: () => void;
  onBack: () => void;
}

export default function CreatorRequestCertifierImage({
  onNext,
  onBack,
}: CreatorRequestCertifierImageProps) {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<IdentityUploadedFile[]>([
    { id: '1', name: '表面', type: 'front', uploaded: false },
    { id: '2', name: '裏面', type: 'back', uploaded: false },
    { id: '3', name: '自撮り', type: 'selfie', uploaded: false },
  ]);

  const [files, setFiles] = useState<Record<IdentityFileKind, File | null>>({
    front: null,
    back: null,
    selfie: null,
  });

  const [progress, setProgress] = useState<Record<IdentityFileKind, number>>({
    front: 0,
    back: 0,
    selfie: 0,
  });

  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCompletePage, setShowCompletePage] = useState(false);

  const inputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
  };

  const allFilesPicked = useMemo(
    () => (['front', 'back', 'selfie'] as const).every((k) => !!files[k]),
    [files]
  );

  const openPicker = (kind: IdentityFileKind) => inputRefs[kind].current?.click();

  const onPick = (kind: IdentityFileKind) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setMessage(null);
    if (!f) return;

    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      setMessage('ファイル形式は JPEG/PNG/PDF のみです');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setMessage('ファイルサイズは 10MB 以下にしてください');
      return;
    }

    setFiles((prev) => ({ ...prev, [kind]: f }));
    setUploadedFiles((prev) =>
      prev.map((item) => (item.type === kind ? { ...item, uploaded: false } : item))
    );
    setProgress((p) => ({ ...p, [kind]: 0 }));
  };

  const handleSubmit = async () => {
    setMessage(null);

    const fFront = files['front'];
    const fBack = files['back'];
    const fSelf = files['selfie'];
    if (!fFront || !fBack || !fSelf) {
      setMessage('すべての書類を選択してください');
      return;
    }

    const IdentityFileKinds = ['front', 'back', 'selfie'] as const;

    setSubmitting(true);

    const presignedUrlRequest: IdentityPresignedUrlRequest = {
      files: IdentityFileKinds.map((k) => {
        const file = files[k]!;
        return {
          kind: k,
          content_type: file.type as FileSpec['content_type'],
          ext: mimeToExt(file.type),
        };
      }),
    };

    try {
      const presignRes = await identityPresignedUrl(presignedUrlRequest);
      const { verification_id, uploads } = presignRes;

      const uploadOne = async (kind: IdentityFileKind) => {
        const file = files[kind]!;
        const item = uploads[kind];
        const header = item.required_headers;

        await putToPresignedUrl(item, file, header, {
          onProgress: (pct) => setProgress((p) => ({ ...p, [kind]: pct })),
        });
        setUploadedFiles((prev) =>
          prev.map((it) => (it.type === kind ? { ...it, uploaded: true } : it))
        );
      };

      await uploadOne('front');
      await uploadOne('back');
      await uploadOne('selfie');

      await completeIdentityUpload(
        verification_id,
        (['front', 'back', 'selfie'] as const).map((k) => ({
          kind: k,
          ext: mimeToExt(files[k]!.type),
        }))
      );

      setMessage('アップロード完了');
      setShowCompletePage(true);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 400 || status === 403) {
        setMessage('URLの有効期限切れかヘッダ不一致です。もう一度やり直してください。');
      } else {
        setMessage('アップロードに失敗しました。時間をおいて再試行してください。');
      }
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // 完了ページ
  if (showCompletePage) {
    return (
      <CommonLayout header={true}>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
          <div className="flex items-center justify-center w-24 h-24 mb-8 bg-primary rounded-full">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            提出を受け付けました!!
          </h2>
          <p className="text-gray-600 mb-2">
            審査結果は46時間以内に通知されます。
          </p>
         
          <p className="text-sm text-gray-600 mb-12 text-center">
            併せてサイト内で通知されますのでご確認ください
          </p>

          <div className="w-full max-w-sm space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 px-6 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              TOPに戻る
            </button>
            <button
              onClick={onNext}
              className="w-full py-4 px-6 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              クリエイタージャンル登録へ進む（任意）
            </button>
          </div>
        </div>
        <BottomNavigation />
      </CommonLayout>
    );
  }

  return (
    <CommonLayout header={true}>
      <Header />
      <div className="min-h-screen px-4 py-6">
        <div className="fixed top-15 left-0 right-0 px-4 py-4">
        {/* エラーメッセージ */}
        {message && (
          <div
            className={`fixed top-4 left-4 right-4 p-4 rounded-lg ${
              message.includes('完了')
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message}
          </div>
        )}
        </div>
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center mr-8">本人確認</h1>
        </div>

        {/* 説明文 */}
        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-4">
            法令遵守・悪質ユーザー（成りすまい等）の観点からクリエイターとユーザーに安心してご利用していただくための「本人確認機能」の提出をお願いしております。
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">本人確認で使用可能な書類</h3>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>・運転免許証</li>
              <li>・パスポート</li>
              <li>・健康保険証</li>
              <li>・マイナンバーカード（顔写真があるもの）</li>
              <li>・その他（外国人登録証、年金手帳、学生証など）</li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-bold text-red-900 mb-2">提出書類の注意事項</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white rounded p-2 text-center">
                <div className="text-red-500 text-2xl mb-1">×</div>
                <p className="text-xs text-gray-700">一部が隠れている</p>
              </div>
              <div className="bg-white rounded p-2 text-center">
                <div className="text-red-500 text-2xl mb-1">×</div>
                <p className="text-xs text-gray-700">画像が切れている</p>
              </div>
              <div className="bg-white rounded p-2 text-center">
                <div className="text-red-500 text-2xl mb-1">×</div>
                <p className="text-xs text-gray-700">画像が不鮮明</p>
              </div>
            </div>
            <p className="text-xs text-gray-700">
              その他写真の加工やプロフィールの生年月日との不一致は再審査となりますのでよろしくお願いいたします。
            </p>
          </div>
        </div>

        {/* アップロードセクション */}
        <div className="mb-24">
          <h3 className="text-sm font-bold text-gray-900 mb-4">本人確認書類の提出</h3>

          {uploadedFiles.map((upload, index) => (
            <div key={upload.id} className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {upload.name}
              </label>

              <input
                ref={inputRefs[upload.type as IdentityFileKind]}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={onPick(upload.type as IdentityFileKind)}
              />

              {files[upload.type as IdentityFileKind] ? (
                <div className="relative">
                  {files[upload.type as IdentityFileKind]?.type.startsWith('image/') ? (
                    <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(files[upload.type as IdentityFileKind]!)}
                        alt={upload.name}
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => {
                          setFiles((prev) => ({ ...prev, [upload.type]: null }));
                          setUploadedFiles((prev) =>
                            prev.map((item) =>
                              item.type === upload.type ? { ...item, uploaded: false } : item
                            )
                          );
                        }}
                        className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                      <span className="text-sm text-gray-700 truncate">
                        {files[upload.type as IdentityFileKind]!.name}
                      </span>
                      <button
                        onClick={() => {
                          setFiles((prev) => ({ ...prev, [upload.type]: null }));
                          setUploadedFiles((prev) =>
                            prev.map((item) =>
                              item.type === upload.type ? { ...item, uploaded: false } : item
                            )
                          );
                        }}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* 進捗バー */}
                  {progress[upload.type as IdentityFileKind] > 0 &&
                    progress[upload.type as IdentityFileKind] < 100 && (
                      <div className="w-full h-2 bg-gray-200 rounded mt-2">
                        <div
                          className="h-2 bg-primary transition-all rounded"
                          style={{ width: `${progress[upload.type as IdentityFileKind]}%` }}
                        />
                      </div>
                    )}
                </div>
              ) : (
                <button
                  onClick={() => openPicker(upload.type as IdentityFileKind)}
                  disabled={submitting}
                  className="w-full py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">タップしてアップロード</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 提出ボタン（固定） */}
        <div className="fixed bottom-20 left-0 right-0 px-4 py-4 bg-white border-t border-gray-200">
          <div className="max-w-screen-md mx-auto">
            <button
              onClick={handleSubmit}
              disabled={!allFilesPicked || submitting}
              className={`w-full py-4 px-6 rounded-full font-semibold transition-all ${
                allFilesPicked && !submitting
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? '提出中...' : '提出'}
            </button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </CommonLayout>
  );
}
