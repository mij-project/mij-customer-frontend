import React, { useState } from 'react';
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
import { X, CreditCard, Store, Smartphone, Wallet, Check } from 'lucide-react';
import { PostDetailData } from '@/api/types/post';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/utils';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post?: PostDetailData;
  planId?: string;
  planName?: string;
  amount?: number;
  onPaymentMethodSelect?: (method: string) => void;
  onPayment?: (telno: string) => void;
  purchaseType: 'single' | 'subscription' | null;
}

export default function SelectPaymentDialog({
  isOpen,
  onClose,
  post,
  onPaymentMethodSelect,
  onPayment,
  purchaseType,
}: PaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  // クレジットカード決済用のstate
  const [telno, setTelno] = useState('');
  const [emv3dSecureConsent, setEmv3dSecureConsent] = useState(false);

  // サムネイル画像を取得（kind=2）
  const thumbnail = post.thumbnail_key || '';

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'クレジットカード',
      description: 'Visa、Mastercard、JCB',
      icon: CreditCard,
      popular: false,
    },
    // {
    //   id: 'bank_transfer',
    //   name: '銀行振込',
    //   description: '指定口座の振込',
    //   icon: Store,
    //   popular: false,
    // },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleConfirm = (methodId: string) => {
    if (termsChecked && privacyChecked && onPaymentMethodSelect) {
      onPaymentMethodSelect(methodId);
    }
    onClose();
  };

  const handlePayment = () => {
    if (onPayment) {
      onPayment(telno);
    }
  };

  // クレジットカード決済フォームが有効かチェック
  const isCreditFormValid = telno && termsChecked && emv3dSecureConsent;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay className="bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 w-full max-w-full md:max-w-md md:mx-auto md:left-1/2 md:right-auto md:-translate-x-1/2 h-auto max-h-[85vh] rounded-t-2xl md:rounded-2xl border-0 bg-white p-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300 z-[1000] overflow-x-hidden">
        <DialogTitle className="sr-only">支払い方法選択</DialogTitle>
        <DialogDescription className="sr-only">
          支払い方法を選択し、利用規約に同意してください
        </DialogDescription>
        <div className="flex flex-col max-h-[85vh] overflow-hidden">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 flex-1 min-w-0 pr-2">支払い方法選択</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-auto w-auto hover:bg-gray-100 rounded-full flex-shrink-0"
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-4">
            {/* 購入内容 */}
            {post && (
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 overflow-hidden">
                {purchaseType === 'single' ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {thumbnail && (
                        <img
                          src={thumbnail}
                          alt="コンテンツサムネイル"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 truncate">@{post.creator.profile_name}</p>
                      <h3 className="font-medium text-gray-900 text-md break-words line-clamp-2">
                        {post.description || 'コンテンツ'}
                      </h3>
                    </div>
                  </div>
                ) : purchaseType === 'subscription' && post.sale_info.plans.length > 0 ? (
                  <div className="flex flex-col space-y-2 min-w-0 max-w-full">
                    <h3 className="font-medium text-gray-900 text-base font-bold">
                      加入対象プラン
                    </h3>
                    <div className="min-w-0 max-w-full">
                      <h2 className="font-medium text-lg font-bold break-all min-w-0">
                        {post.sale_info.plans[0].name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed break-all min-w-0">
                        {post.sale_info.plans[0].description}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* 支払い方法一覧 */}
            <div className="px-4 py-3 space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                支払い方法を選択してください
              </h3>

              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                const isSelected = selectedMethod === method.id;

                return (
                  <div
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`relative p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4
                            className={`font-medium ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}
                          >
                            {method.name}
                          </h4>
                          {method.popular && (
                            <span className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                              人気
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                          {method.description}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* クレジットカード決済情報入力フォーム（クレジットカード選択時のみ表示） */}
            {selectedMethod === 'credit_card' && (
              <div className="px-4 py-3 space-y-4 border-t border-gray-200">
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
                    placeholder="09012345678"
                  />
                  <p className="text-xs text-gray-500">ハイフンなしで入力してください</p>
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
            )}

            {/* 支払い方法詳細 */}
            <div className="px-4 py-3 space-y-3 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                支払い金額 <span className="text-gray-500 text-xs">手数料10％含む</span>
              </h3>
              <div className="text-sm text-gray-600">
                {purchaseType === 'single' && post?.sale_info.price !== null && (
                  <div className="space-y-2">
                    <div className="pt-2">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <h5 className="text-sm font-bold text-gray-500 flex-shrink-0">合計</h5>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-right break-all min-w-0">
                          ￥{formatPrice(Math.round(post.sale_info.price.price * 1.1))}
                        </h1>
                      </div>
                    </div>
                  </div>
                )}
                {purchaseType === 'subscription' && post?.sale_info.plans.length > 0 && (
                  <div className="space-y-2">
                    <div className="pt-2">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <h5 className="text-sm font-bold text-gray-500 flex-shrink-0">合計</h5>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-right break-all min-w-0">
                          ￥{formatPrice(Math.round(post.sale_info.plans[0].price * 1.1))}
                        </h1>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 注意事項 */}
            <div className="px-4 py-3 space-y-3 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">ご注意事項</h3>
              <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                <div className="text-sm text-yellow-800">
                  <ul className="space-y-1 text-xs">
                    <li>• 決済完了後、即座にコンテンツがご利用いただけます</li>
                    <li>• 一度購入したコンテンツは無期限で視聴可能です</li>
                    <li>• コンテンツのダウンロードはできません</li>
                    <li>• 購入後の返金はできません</li>
                  </ul>
                </div>
                {/* チェックボックスを表示 */}
                <div className="flex flex-col space-y-3 mt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsChecked}
                      onCheckedChange={(checked) =>
                        setTermsChecked(checked === 'indeterminate' ? false : checked)
                      }
                    />
                    <label htmlFor="terms" className="text-xs text-gray-600">
                      利用規約に同意する <span className="text-red-500">*</span>
                    </label>
                  </div>
                  {selectedMethod === 'credit_card' && (
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="emv3d-consent-agreement"
                        checked={emv3dSecureConsent}
                        onCheckedChange={(checked) =>
                          setEmv3dSecureConsent(checked === 'indeterminate' ? false : checked)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="emv3d-consent-agreement"
                          className="text-xs text-gray-600 cursor-pointer"
                        >
                          EMV 3-D Secure 本人認証サービスに同意する{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          決済時に本人認証のため、カード会社に電話番号・メールアドレス等の個人情報を送信します。
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="space-y-3">
              {selectedMethod === 'credit_card' ? (
                // クレジットカード選択時は決済ボタンを表示
                <Button
                  onClick={handlePayment}
                  disabled={!isCreditFormValid}
                  className={`w-full py-3 rounded-lg font-semibold text-sm sm:text-base ${
                    isCreditFormValid
                      ? 'bg-primary hover:bg-primary/80 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="break-words line-clamp-2">
                    {isCreditFormValid
                      ? '決済画面へ進む'
                      : '電話番号を入力し、利用規約と3-D Secureに同意してください'}
                  </span>
                </Button>
              ) : (
                // その他の支払い方法選択時は従来のボタンを表示
                <Button
                  onClick={() => handleConfirm(selectedMethod)}
                  disabled={!selectedMethod || !privacyChecked}
                  className={`w-full py-3 rounded-lg font-semibold text-sm sm:text-base ${
                    selectedMethod && privacyChecked
                      ? 'bg-primary hover:bg-primary/80 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="break-words line-clamp-2">
                    {selectedMethod && termsChecked && privacyChecked
                      ? '選択した支払い方法で進む'
                      : '支払い方法を選択し、同意事項にチェックしてください'}
                  </span>
                </Button>
              )}

              <Button
                variant="outline"
                onClick={onClose}
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
