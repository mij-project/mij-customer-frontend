import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PostDetailData } from '@/api/types/post';
import { formatPrice } from '@/lib/utils';
import { X } from 'lucide-react';
import PaymentLoading from '@/components/common/PaymentLoading';

interface CreditPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostDetailData;
  onPayment: (telno: string) => void;
  purchaseType: 'single' | 'subscription';
}

export default function CreditPaymentDialog({
  isOpen,
  onClose,
  post,
  onPayment,
  purchaseType,
}: CreditPaymentDialogProps) {
  const [showPaymentLoading, setShowPaymentLoading] = useState(false);
  const [telno, setTelno] = useState('');
  const [emv3dSecureConsent, setEmv3dSecureConsent] = useState(false);

  // 重複実行を防ぐためのRef
  const isProcessing = useRef(false);

  const handleSubmit = () => {
    // 既に処理中の場合は何もしない
    if (isProcessing.current) return;

    isProcessing.current = true;
    setShowPaymentLoading(true);
    onPayment(telno);
  };

  const handlePaymentComplete = () => {
    isProcessing.current = false;
    setShowPaymentLoading(false);
    onClose();
  };

  const isFormValid =
    telno &&
    emv3dSecureConsent;

  return (
    <>
      {/* 決済ローディング - Dialogの外側でより高いz-index */}
      {showPaymentLoading && (
        <PaymentLoading onComplete={handlePaymentComplete} autoComplete={true} duration={5000} />
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay className="bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 max-w-none w-full h-auto max-h-[80vh] rounded-t-2xl border-0 bg-white p-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300 z-[1000]">
          <DialogTitle className="sr-only">クレジットカード決済</DialogTitle>
          <DialogDescription className="sr-only">
            クレジットカード情報を入力して下さい。
          </DialogDescription>
          <div className="flex flex-col max-h-[80vh]">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-gray-900">クレジットカード決済</h2>
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
              {/* 支払い金額 */}
              {/* 投稿コンテンツがないと表示しない */}
              {post && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">支払い金額</span>
                    {/* purchaseTypeの内容によって表示する金額を分岐 */}
                    {purchaseType === 'single' && post.sale_info.price !== null ? (
                      <h1 className="text-3xl font-bold text-gray-900">
                        ¥{formatPrice(Math.round(post.sale_info.price.price * 1.1))}
                      </h1>
                    ) : purchaseType === 'subscription' && post.sale_info.plans.length > 0 && post.sale_info.plans[0]?.price > 0 ? (
                      <h1 className="text-3xl font-bold text-gray-900">
                        ¥{formatPrice(Math.round(post.sale_info.plans[0].price * 1.1))}
                      </h1>
                    ) : null}
                  </div>
                </div>
              )}

              {/* 決済情報入力フォーム */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">決済情報</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    決済に必要な情報を入力して下さい。
                  </p>
                </div>

                {/* 電話番号 */}
                <div className="space-y-2">
                  <Label htmlFor="telno" className="text-sm font-medium text-gray-700">
                    電話番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="telno"
                    type="tel"
                    value={telno}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setTelno(value);
                    }}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">ハイフンなしで入力してください</p>
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
                        決済時に本人認証のため、カード会社に電話番号・メールアドレス等の個人情報を送信します。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 注意事項 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">ご注意事項</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 決済は安全なSSL暗号化通信で行われます</li>
                    <li>• 次の画面でクレジットカード情報を入力していただきます</li>
                    <li>• EMV 3-D Secureによる本人認証が行われます</li>
                    <li>• 決済完了後、即座にコンテンツがご利用いただけます</li>
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
                      ? '決済画面へ進む'
                      : 'すべての項目を入力してください'}
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
