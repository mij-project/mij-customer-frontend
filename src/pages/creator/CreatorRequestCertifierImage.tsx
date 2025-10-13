import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Camera, CheckCircle } from 'lucide-react';
import AuthLayout from '@/features/auth/AuthLayout';
import VerificationLayout from '@/features/auth/VerificationLayout';
import { CreatorRequestCertifierImageProps, IdentityUploadedFile, IdentityPresignedUrlRequest } from '@/api/types/identity';
import { identityPresignedUrl, completeIdentityUpload } from '@/api/endpoints/identity';
import { putToPresignedUrl } from '@/service/s3FileUpload';
import { IdentityFileKind } from '@/constants/constants';
import { FileSpec } from '@/api/types/commons';
import FileUploadGrid from '@/components/common/FileUploadGrid';
import ErrorMessage from '@/components/common/ErrorMessage';

const mimeToExt = (mime: string): FileSpec['ext'] => {
  if (mime === "image/png") return "png";
  if (mime === "application/pdf") return "pdf";
  return "jpg" as FileSpec['ext'];
};

export default function CreatorRequestCertifierImage({
  onNext,
  onBack,
  currentStep,
  totalSteps,
  steps,
}: CreatorRequestCertifierImageProps) {

  const [uploadedFiles, setUploadedFiles] = useState<IdentityUploadedFile[]>([
    { id: '1', name: '身分証明書（表面）', type: 'front', uploaded: false },
    { id: '2', name: '身分証明書（裏面）', type: 'back', uploaded: false },
    { id: '3', name: '本人確認写真',     type: 'selfie',   uploaded: false }
  ]);

  /** ファイル実体・進捗・メッセージ */
  const [files, setFiles] = useState<Record<IdentityFileKind, File | null>>({
    'front': null,
    'back': null,
    'selfie': null
  });

  const [progress, setProgress] = useState<Record<IdentityFileKind, number>>({
    'front': 0, 'back': 0, 'selfie': 0
  });
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** 隠しinputを種類ごとに用意（クリックで発火） */
  const inputRefs = {
    'front': useRef<HTMLInputElement>(null),
    'back':  useRef<HTMLInputElement>(null),
    'selfie':   useRef<HTMLInputElement>(null),
  };

  const allFilesPicked = useMemo(
    () => (['front','back','selfie'] as const).every(k => !!files[k]),
    [files]
  );
  /** ファイル選択ボタン押下 → input を click */
  const openPicker = (kind: IdentityFileKind) => inputRefs[kind].current?.click();

  /** ファイル選択時の処理（まだS3には送らない） */
  const onPick = (kind: IdentityFileKind) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setMessage(null);
    if (!f) return;

    // フロント側バリデーション（最小）
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      setMessage('ファイル形式は JPEG/PNG/PDF のみです');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setMessage('ファイルサイズは 10MB 以下にしてください');
      return;
    }

    setFiles(prev => ({ ...prev, [kind]: f }));
    setUploadedFiles(prev => prev.map(item =>
      item.type === kind ? { ...item, uploaded: false } : item
    ));
    setProgress(p => ({ ...p, [kind]: 0 }));
  };

  /** 送信（presign → PUT → complete） */
  const handleSubmit = async () => {

    setMessage(null);
    // 3ファイル存在チェック（キー名修正）
    const fFront = files['front'];
    const fBack  = files['back'];
    const fSelf  = files['selfie'];
    if (!fFront || !fBack || !fSelf) {
      setMessage('すべての書類を選択してください');
      return;
    }

  const IdentityFileKinds = ['front','back','selfie'] as const;

    setSubmitting(true);
    // presign payload（ファイルごと）
    const presignedUrlRequest: IdentityPresignedUrlRequest = {
      files: IdentityFileKinds.map((k) => {
        const file = files[k]!;
        return {
          kind: k,
          content_type: file.type as FileSpec['content_type'],
          ext: mimeToExt(file.type),
        };
      })
    };

    try {
      // 1) presign
      const presignRes = await identityPresignedUrl(presignedUrlRequest);
      const { verification_id, uploads } = presignRes;

      // 2) S3 PUT（presigned には CSRF不要なので素の axios を使用）
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

      // 3) complete（各ファイルの ext を渡す）
      await completeIdentityUpload(
        verification_id,
        (['front','back','selfie'] as const).map((k) => ({
          kind: k,
          ext: mimeToExt(files[k]!.type),
        }))
      );

      setMessage('アップロード完了。審査をお待ちください。');
      if (onNext) onNext();
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

  const allFilesUploaded = uploadedFiles.every(f => f.uploaded);

  /** カードUI（共通） */
  const Card = ({ file, compact = false }: { file: IdentityUploadedFile; compact?: boolean }) => (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        file.uploaded ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <div className="flex flex-col items-center space-y-2">
        {file.uploaded ? (
          <CheckCircle className="h-8 w-8 text-green-500" />
        ) : file.type === 'selfie' ? (
          <Camera className="h-8 w-8 text-gray-400" />
        ) : (
          <FileText className="h-8 w-8 text-gray-400" />
        )}

        <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>

        <input
          ref={inputRefs[file.type]}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={onPick(file.type)}
        />

        {!file.uploaded && (
          <Button
            onClick={() => openPicker(file.type)}
            variant="outline"
            className="mt-2"
            disabled={submitting}
          >
            <Upload className="h-4 w-4 mr-2" />
            ファイルを選択
          </Button>
        )}

        {/* 進捗バー */}
        <div className="w-full h-2 bg-gray-200 rounded mt-2 overflow-hidden">
          <div
            className="h-2 bg-primary transition-all"
            style={{ width: `${progress[file.type]}%` }}
          />
        </div>

        {/* 選択済みファイル名表示 */}
        {files[file.type] && !file.uploaded && (
          <p className="text-xs text-gray-500 mt-1">
            {files[file.type]!.name}（{Math.round(files[file.type]!.size / 1024)} KB）
          </p>
        )}

        {file.uploaded && <p className="text-xs text-green-600">アップロード完了</p>}
      </div>
    </div>
  );

  const PageBody = (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">身分証明書のアップロード</h2>
        <p className="text-sm text-gray-600">本人確認のため、以下の書類をアップロードしてください</p>
      </div>

      <FileUploadGrid 
        uploads={uploadedFiles.map(upload => ({
          id: upload.id,
          name: upload.name,
          type: upload.type,
          uploaded: upload.uploaded,
          file: files[upload.type as IdentityFileKind],
          progress: progress[upload.type as IdentityFileKind],
          disabled: submitting,
          accept: 'image/jpeg,image/png,application/pdf',
          icon: upload.type === 'selfie' ? 'camera' : 'file',
          showPreview: true, // 全てのファイルタイプでプレビューを表示
          onFileSelect: (type: string, file: File | null) => {
            setMessage('');
            if (file) {
              // フロント側バリデーション（最小）
              const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
              if (!allowed.includes(file.type)) {
                setMessage('ファイル形式は JPEG/PNG/PDF のみです');
                return;
              }
              if (file.size > 10 * 1024 * 1024) {
                setMessage('ファイルサイズは 10MB 以下にしてください');
                return;
              }

              setFiles(prev => ({ ...prev, [type]: file }));
              setUploadedFiles(prev => prev.map(item =>
                item.type === type ? { ...item, uploaded: false } : item
              ));
              setProgress(p => ({ ...p, [type]: 0 }));
            } else {
              setFiles(prev => ({ ...prev, [type]: null }));
              setUploadedFiles(prev => prev.map(item =>
                item.type === type ? { ...item, uploaded: false } : item
              ));
              setProgress(p => ({ ...p, [type]: 0 }));
            }
          }
        }))}
        columns={1}
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">アップロード時の注意事項</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• 画像は鮮明で文字が読み取れるものをご用意ください</li>
          <li>• ファイル形式：JPEG、PNG、PDF（最大10MB）</li>
          <li>• 身分証明書は有効期限内のものをご使用ください</li>
          <li>• 本人確認写真は身分証明書と同じ人物であることを確認できるもの</li>
        </ul>
      </div>

      <div className="flex space-x-4">
        {onBack && (
          <Button onClick={onBack} variant="outline" className="flex-1" disabled={submitting}>
            戻る
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={submitting || !allFilesPicked}
          className={`${onBack ? 'flex-1' : 'w-full'} bg-primary hover:bg-primary/90 text-white disabled:bg-gray-300`}
        >
          {submitting ? '提出中…' : '確認書類を提出する'}
        </Button>
      </div>

      {message && (
        <ErrorMessage 
          message={message} 
          variant={message.includes('完了') ? 'success' : 'error'}
          onClose={() => setMessage(null)}
        />
      )}
    </div>
  );

  if (currentStep && totalSteps && steps) {
    return (
      <VerificationLayout currentStep={currentStep} totalSteps={totalSteps} steps={steps}>
        {PageBody}
      </VerificationLayout>
    );
  }

  return (
    <AuthLayout>
      {/* 上部のアイコンヘッダー（元の見た目を維持） */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary rounded-full">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">身分証明書確認</h2>
        <p className="text-sm text-gray-600">本人確認のため、身分証明書をアップロードしてください</p>
      </div>
      {PageBody}
    </AuthLayout>
  );
}
