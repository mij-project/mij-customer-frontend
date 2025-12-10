import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import PaymentLoading from '@/components/common/PaymentLoading';

interface CardRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

export default function CardRegistrationDialog({
  isOpen,
  onClose,
  onRegister,
}: CardRegistrationDialogProps) {
  const [emv3dSecureConsent, setEmv3dSecureConsent] = useState(false);

  // 重複実行を防ぐためのRef
  const isProcessing = useRef(false);

  const handleSubmit = () => {
    // 既に処理中の場合は何もしない
    if (isProcessing.current) return;

    isProcessing.current = true;
    onRegister();
  };

  const isFormValid = emv3dSecureConsent;

  return (
    <>
      {/* 決済ローディング - Dialogの外側でより高いz-index */}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay className="bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 max-w-none w-full h-auto max-h-[80vh] rounded-t-2xl border-0 bg-white p-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300 z-[1000]">
          <DialogTitle className="sr-only">クレジットカード登録</DialogTitle>
          <DialogDescription className="sr-only">
            クレジットカード情報を登録します。
          </DialogDescription>
          <div className="flex flex-col max-h-[80vh]">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-gray-900">クレジットカード登録</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 h-auto w-auto hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-6">
              {/* カード登録説明 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">カード情報の登録</h3>
                <p className="text-sm text-gray-600">
                  クレジットカード情報を登録することで、次回以降の決済がスムーズになります。
                </p>
              </div>

              {/* EMV 3-D Secure 同意 */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="emv3d-consent"
                    checked={emv3dSecureConsent}
                    onCheckedChange={(checked) => setEmv3dSecureConsent(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="emv3d-consent"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      EMV 3-D Secure 本人認証サービスに同意する{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      カード登録時に本人認証のため、カード会社に電話番号・メールアドレス等の個人情報を送信します。
                    </p>
                  </div>
                </div>
              </div>

              {/* 注意事項 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">ご注意事項</p>
                  <ul className="space-y-1 text-xs">
                    <li>• カード情報は安全なSSL暗号化通信で送信されます</li>
                    <li>• 次の画面でクレジットカード情報を入力していただきます</li>
                    <li>• EMV 3-D Secureによる本人認証が行われます</li>
                    <li>• カード情報は決済代行会社により安全に保管されます</li>
                    <li>• 登録したカード情報は支払い方法設定から削除できます</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isProcessing.current}
                  className={`w-full py-3 rounded-lg font-semibold ${
                    isFormValid && !isProcessing.current
                      ? 'bg-primary hover:bg-primary/80 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing.current
                    ? '処理中...'
                    : isFormValid
                      ? 'カード登録画面へ進む'
                      : '同意してください'}
                </Button>

                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isProcessing.current}
                  className="w-full py-3 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
