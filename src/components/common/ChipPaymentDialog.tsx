import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { X, CreditCard, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/utils';
import { createChipPayment } from '@/api/endpoints/payment';
import { NG_WORDS } from '@/constants/ng_word';
import ErrorMessage from '@/components/common/ErrorMessage';

interface ChipPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientUserId: string;
  recipientName: string;
  recipientAvatar?: string;
}

export default function ChipPaymentDialog({
  isOpen,
  onClose,
  recipientUserId,
  recipientName,
  recipientAvatar,
}: ChipPaymentDialogProps) {
  // 金額（500円〜5,000円）
  const [amount, setAmount] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  // 決済方法（常にクレジットカード）
  const [selectedMethod] = useState<string>('credit_card');

  // 同意チェックボックス
  const [termsChecked, setTermsChecked] = useState(false);
  const [emv3dSecureConsent, setEmv3dSecureConsent] = useState(false);

  // 決済処理中フラグ
  const [isProcessing, setIsProcessing] = useState(false);

  // テキストエリアの自動リサイズ用のref
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  // メッセージのNGワードチェック
  const detectedNgWordsInMessage = useMemo(() => {
    if (!message) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (message.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [message]);

  // ダイアログが閉じた時にリセット
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setAmountError('');
      setMessage('');
      setTermsChecked(false);
      setEmv3dSecureConsent(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // テキストエリアの自動リサイズ（最低4行、それ以上は内容に応じて拡張）
  useEffect(() => {
    const el = messageTextareaRef.current;
    if (!el) return;

    // 一度高さをリセットして正確なscrollHeightを取得
    el.style.height = 'auto';

    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight || '20');
    const paddingTop = parseFloat(style.paddingTop || '8');
    const paddingBottom = parseFloat(style.paddingBottom || '8');
    const borderTop = parseFloat(style.borderTopWidth || '1');
    const borderBottom = parseFloat(style.borderBottomWidth || '1');

    // 最低4行分の高さを計算
    const minHeight = lineHeight * 4 + paddingTop + paddingBottom + borderTop + borderBottom;
    
    // 内容に応じた高さを取得
    const contentHeight = el.scrollHeight;
    
    // 最低4行分の高さと、内容に応じた高さの大きい方を採用
    const finalHeight = Math.max(minHeight, contentHeight);
    
    el.style.height = `${finalHeight}px`;
    
    // 内容が4行を超える場合はスクロール可能に
    el.style.overflowY = contentHeight > minHeight ? 'auto' : 'hidden';
  }, [message]);

  // 金額入力のバリデーション
  const handleAmountChange = (value: string) => {
    // 数字のみ入力を許可
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);

    // バリデーション
    if (numericValue === '') {
      setAmountError('');
    } else {
      const num = parseInt(numericValue, 10);
      if (num < 500) {
        setAmountError('最低金額は500円です');
      } else if (num > 5000) {
        setAmountError('最高金額は5,000円です');
      } else {
        setAmountError('');
      }
    }
  };

  // 決済ボタンを押したときの処理
  const handlePayment = async () => {
    if (isProcessing) return;

    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount < 500 || numericAmount > 5000) {
      setAmountError('500円〜5,000円の範囲で入力してください');
      return;
    }

    setIsProcessing(true);

    try {
      // CREDIX決済セッション発行API呼び出し
      const response = await createChipPayment({
        recipient_user_id: recipientUserId,
        amount: numericAmount,
        message: message || undefined,
      });

      // CREDIX決済画面にリダイレクト
      const paymentUrl = `${response.data.payment_url}?sid=${response.data.session_id}`;
      window.location.href = paymentUrl;
    } catch (error: any) {
      console.error('投げ銭決済セッション発行エラー:', error);

      let errorMessage = '決済処理に失敗しました。もう一度お試しください。';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      alert(errorMessage);
      setIsProcessing(false);
    }
  };

  // ダイアログを閉じる際にリセット
  const handleClose = () => {
    if (isProcessing) return;
    setAmount('');
    setAmountError('');
    setTermsChecked(false);
    setEmv3dSecureConsent(false);
    onClose();
  };

  // フォームが有効かチェック（金額入力 + バリデーションOK + 利用規約同意 + EMV 3-D Secure同意 + NGワードなし）
  const isFormValid =
    amount !== '' &&
    amountError === '' &&
    parseInt(amount, 10) >= 500 &&
    parseInt(amount, 10) <= 5000 &&
    termsChecked &&
    emv3dSecureConsent &&
    detectedNgWordsInMessage.length === 0;

  // 手数料込みの金額を計算
  const getTotalAmount = () => {
    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount)) return 0;
    return Math.round(numericAmount * 1.1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-[1000]" />
      <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 w-full max-w-full md:max-w-md md:mx-auto md:left-1/2 md:right-auto md:-translate-x-1/2 h-auto max-h-[85vh] rounded-t-2xl md:rounded-2xl border-0 bg-white p-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300 z-[1000] overflow-x-hidden">
        <DialogTitle className="sr-only">チップを贈る</DialogTitle>
        <DialogDescription className="sr-only">
          {recipientName}にチップを贈ります。金額を入力し、決済方法を選択してください
        </DialogDescription>

        <div className="flex flex-col max-h-[85vh] overflow-hidden">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 flex-1 min-w-0 pr-2">チップを贈る</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isProcessing}
              className="p-1 h-auto w-auto hover:bg-gray-100 rounded-full flex-shrink-0"
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-4">
            {/* 受取人情報 */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 mb-3">
                  <img
                    src={recipientAvatar || '/assets/no-image.svg'}
                    alt={recipientName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-base text-gray-900 font-medium">
                    {recipientName}さんにチップを送ります。
                  </p>
									<p className="text-md text-gray-500">{recipientName}さんとのDMが解放されます！</p>
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-700 mb-3">金額を入力</h3>
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">¥</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="500 〜 5,000"
                    disabled={isProcessing}
                    className={`w-full pl-10 pr-4 py-3 text-lg border bg-transparent rounded-lg focus:outline-none focus:ring-2 ${
                      amountError
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-primary'
                    }`}
                  />
                </div>
                {/* 金額タグ */}
                <div className="flex gap-2 mt-2">
                  {[1000,2000, 3000, 5000].map((tagAmount) => (
                    <button
                      key={tagAmount}
                      type="button"
                      onClick={() => handleAmountChange(tagAmount.toString())}
                      disabled={isProcessing}
                      className="px-4 py-1.5 text-sm font-medium text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ¥{tagAmount.toLocaleString()}
                    </button>
                  ))}
                </div>
                {amountError && (
                  <p className="text-xs text-red-600 mt-1">{amountError}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  ※ 500円〜5,000円の範囲で入力してください
                </p>
              </div>

              <h3 className="text-sm font-medium text-gray-700 mb-3 mt-3">メッセージを入力(任意)</h3>
              <textarea
                ref={messageTextareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="メッセージを入力"
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 bg-transparent resize-none ${
                  detectedNgWordsInMessage.length > 0
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
                rows={4}
              />
              {detectedNgWordsInMessage.length > 0 && (
                <div className="mt-2">
                  <ErrorMessage
                    message={[
                      `NGワードが検出されました: ${detectedNgWordsInMessage.join('、')}`,
                      `検出されたNGワード数: ${detectedNgWordsInMessage.length}個`,
                    ]}
                    variant="error"
                  />
                </div>
              )}
            </div>

            {/* 決済方法選択（固定：クレジットカード） */}
            <div className="px-4 py-4 space-y-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">決済方法</h3>
              <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">クレジットカード</h4>
                    <p className="text-sm text-blue-700">Visa、Mastercard、JCB</p>
                  </div>
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  次の画面でクレジットカード情報を入力していただきます
                </p>
              </div>
            </div>

            {/* 支払い金額 */}
            <div className="px-4 py-4 space-y-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">
                支払い金額 <span className="text-gray-500 text-xs">手数料10％含む</span>
              </h3>
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-sm font-bold text-gray-500">合計</h5>
                <div className="text-right">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {amount ? `¥${formatPrice(getTotalAmount())}` : '—'}
                  </h1>
                </div>
              </div>
            </div>

            {/* 注意事項と同意チェックボックス */}
            <div className="px-4 py-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">ご注意事項</h3>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-800">
                  <ul className="space-y-1 text-xs">
                    <li>• 決済完了後、チップが相手に送られます</li>
                    <li>• 一度送信したチップは取り消しできません</li>
                    <li>• 購入後の返金はできません</li>
                  </ul>
                </div>

                {/* チェックボックス */}
                <div className="flex flex-col space-y-3 mt-4">
                  {/* 一括チェック */}
                  <div className="flex items-center space-x-2 pb-2 border-b border-yellow-200">
                    <Checkbox
                      id="select-all"
                      checked={termsChecked && emv3dSecureConsent}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === 'indeterminate' ? false : checked;
                        setTermsChecked(isChecked);
                        setEmv3dSecureConsent(isChecked);
                      }}
                      disabled={isProcessing}
                    />
                    <label htmlFor="select-all" className="text-xs font-medium text-gray-700 cursor-pointer">
                      すべて同意する
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsChecked}
                      onCheckedChange={(checked) =>
                        setTermsChecked(checked === 'indeterminate' ? false : checked)
                      }
                      disabled={isProcessing}
                    />
                    <label htmlFor="terms" className="text-xs text-gray-700 cursor-pointer">
                      利用規約に同意する <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="emv3d-consent"
                      checked={emv3dSecureConsent}
                      onCheckedChange={(checked) =>
                        setEmv3dSecureConsent(checked === 'indeterminate' ? false : checked)
                      }
                      disabled={isProcessing}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="emv3d-consent" className="text-xs text-gray-700 cursor-pointer">
                        EMV 3-D Secure 本人認証サービスに同意する{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        決済時に本人認証のため、カード会社に個人情報を送信します
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">※初回のみ電話番号・年齢の入力があります。</p>
            </div>
          </div>

          {/* フッター */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="space-y-3">
              <Button
                onClick={handlePayment}
                disabled={!isFormValid || isProcessing}
                className={`w-full py-3 rounded-lg font-semibold text-sm sm:text-base ${
                  isFormValid && !isProcessing
                    ? 'bg-primary hover:bg-primary/80 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing
                  ? '処理中...'
                  : isFormValid
                  ? '決済画面へ進む'
                  : '金額を入力し、利用規約に同意してください'}
              </Button>

              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="w-full py-3 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}