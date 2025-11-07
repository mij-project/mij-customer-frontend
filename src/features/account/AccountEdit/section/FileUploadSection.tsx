import React from 'react';
import { Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileUploadSectionProps } from '@/features/account/AccountEdit/types';

export default function FileUploadSection({
  uploadedFiles,
  files,
  progress,
  submitting,
  inputRefs,
  onPick,
  openPicker,
}: FileUploadSectionProps) {
  return (
    <div className="space-y-6">
      {uploadedFiles.map((file) => (
        <div key={file.id}>
          <Label className="block text-sm font-medium text-gray-700 mb-3">{file.name}</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              file.uploaded
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              {file.uploaded ? (
                <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
              ) : file.type === 'avatar' ? (
                <Camera className="h-12 w-12 text-gray-400" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}

              <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>

              <input
                ref={inputRefs[file.type]}
                type="file"
                accept="image/jpeg,image/png"
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
        </div>
      ))}

      <div className="text-sm text-gray-500">
        著作権を侵害する恐れのあるカバー画像とアバター画像は審査対象です。
        <br />
        詳細は利用規約・ガイドライン一覧をご確認ください。
      </div>
    </div>
  );
}
