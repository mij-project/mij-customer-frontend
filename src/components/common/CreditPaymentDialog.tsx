import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PostDetailData } from '@/api/types/post';
import { formatPrice } from '@/lib/utils';
import { X } from 'lucide-react';
import PaymentLoading from '@/components/common/PaymentLoading';

interface CreditPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostDetailData;
  onPayment: () => void;
  purchaseType: 'single' | 'subscription';
}

export default function CreditPaymentDialog({ isOpen, onClose, post, onPayment, purchaseType }: CreditPaymentDialogProps) {
  const [showPaymentLoading, setShowPaymentLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardName: '',
    cardNumber: '',
    securityCode: '',
    expiryMonth: '',
    expiryYear: ''
  });
  
  // 重複実行を防ぐためのRef
  const isProcessing = useRef(false);

  const handleInputChange = (field: string, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    // 数字のみを抽出し、4桁ごとにスペースを挿入
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    handleInputChange('cardNumber', formatted);
  };

  const handleSubmit = () => {
    // 既に処理中の場合は何もしない
    if (isProcessing.current) return;
    
    isProcessing.current = true;
    setShowPaymentLoading(true);
    onPayment();
  };

  const handlePaymentComplete = () => {
    isProcessing.current = false;
    setShowPaymentLoading(false);
    onClose();
  };

  const isFormValid = cardData.cardName && cardData.cardNumber && cardData.securityCode && cardData.expiryMonth && cardData.expiryYear;

  return (
    <>
      {/* 決済ローディング - Dialogの外側でより高いz-index */}
      {showPaymentLoading && (
        <PaymentLoading 
          onComplete={handlePaymentComplete}
          autoComplete={true}
          duration={5000}
        />
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay className="bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 max-w-none w-full h-auto max-h-[80vh] rounded-t-2xl border-0 bg-white p-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300">
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
                    {purchaseType === 'single' ? (
                      <h1 className="text-3xl font-bold text-gray-900">¥{formatPrice(Math.round(post.single.amount * 1.1))}</h1>
                    ) : purchaseType === 'subscription' ? (
                      <h1 className="text-3xl font-bold text-gray-900">¥{formatPrice(Math.round(post.subscription.amount * 1.1))}</h1>
                    ) : null}
                    </div>
                  </div>
              )}

              {/* クレジットカード情報入力フォーム */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">クレジットカード情報</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    クレジットカード情報を入力して下さい。
                  </p>
                </div>

                {/* カード名義 */}
                <div className="space-y-2">
                  <Label htmlFor="cardName" className="text-sm font-medium text-gray-700">
                    カード名義
                  </Label>
                  <Input
                    id="cardName"
                    type="text"
                    placeholder="TARO YAMADA"
                    value={cardData.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value.toUpperCase())}
                    className="w-full"
                  />
                </div>

                {/* カード番号 */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                    カード番号
                  </Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    maxLength={19} // 16桁 + 3つのスペース
                    className="w-full"
                  />
                </div>

                {/* 有効期限とセキュリティコード */}
                <div className="grid grid-cols-2 gap-4">
                  {/* 有効期限 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      有効期限
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        placeholder="MM"
                        value={cardData.expiryMonth}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                          handleInputChange('expiryMonth', value);
                        }}
                        maxLength={2}
                        className="w-full"
                      />
                      <span className="flex items-center text-gray-500">/</span>
                      <Input
                        type="text"
                        placeholder="YY"
                        value={cardData.expiryYear}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                          handleInputChange('expiryYear', value);
                        }}
                        maxLength={2}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* セキュリティコード */}
                  <div className="space-y-2">
                    <Label htmlFor="securityCode" className="text-sm font-medium text-gray-700">
                      セキュリティコード
                    </Label>
                    <Input
                      id="securityCode"
                      type="text"
                      placeholder="123"
                      value={cardData.securityCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        handleInputChange('securityCode', value);
                      }}
                      maxLength={4}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* 注意事項 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">ご注意事項</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 決済は安全なSSL暗号化通信で行われます</li>
                    <li>• カード情報は保存されません</li>
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
                      ? '決済を実行する' 
                      : 'すべての項目を入力してください'
                  }
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