import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, CreditCard, Store, Smartphone, Wallet, Check } from 'lucide-react';
import { PostDetailData } from '@/api/types/post';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/utils';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post?: PostDetailData;
  onPaymentMethodSelect?: (method: string) => void;
  purchaseType: 'single' | 'subscription' | null;
}

export default function SelectPaymentDialog({ isOpen, onClose, post, onPaymentMethodSelect, purchaseType }: PaymentDialogProps) {

  console.log('post', post);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  // サムネイル画像を取得（kind=2）
  const thumbnail = post?.media_info.find(m => m.kind === 2)?.storage_key || post?.media_info[0]?.storage_key;

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'クレジットカード',
      description: 'Visa、Mastercard、JCB、American Express',
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 max-w-none w-full h-auto max-h-[85vh] rounded-t-2xl border-0 bg-white p-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300">
        <DialogTitle className="sr-only">支払い方法選択</DialogTitle>
        <DialogDescription className="sr-only">
          支払い方法を選択し、利用規約に同意してください
        </DialogDescription>
        <div className="flex flex-col max-h-[85vh]">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-gray-900">支払い方法選択</h2>
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
          <div className="flex-1 overflow-y-auto min-h-0 pb-4">
            {/* 購入内容 */}
            {post && (
              <div className="p-4 border-b border-gray-100 bg-gray-50 overflow-hidden">
                {purchaseType === 'single'  ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {thumbnail && (
                        <img
                          src={thumbnail}
                          alt="コンテンツサムネイル"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{post.description || 'コンテンツ'}</h3>
                      <p className="text-xs text-gray-600 truncate">@{post.creator.profile_name}</p>
                    </div>
                  </div>
                ): (purchaseType === 'subscription' && post.sale_info.plans.length > 0) ? (
                  <div className="flex flex-col space-y-2 min-w-0 max-w-full">
                    <h3 className="font-medium text-gray-900 text-base font-bold">加入対象プラン</h3>
                    <div className="min-w-0 max-w-full">
                      <h2 className="font-medium text-lg font-bold break-all min-w-0">{post.sale_info.plans[0].name}</h2>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed break-all min-w-0">{post.sale_info.plans[0].description}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* 支払い方法一覧 */}
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">支払い方法を選択してください</h3>
              
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
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-5 w-5 ${
                          isSelected ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {method.name}
                          </h4>
                          {method.popular && (
                            <span className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                              人気
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isSelected ? 'text-blue-700' : 'text-gray-600'
                        }`}>
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

						{/* 支払い方法詳細 */}
						<div className="p-4 space-y-3 border-t border-gray-200">
							<h3 className="text-sm font-medium text-gray-700 mb-3">支払い金額 <span className="text-gray-500 text-xs">手数料10％含む</span> </h3>
							<div className="text-sm text-gray-600">
                {purchaseType === 'single' && post?.sale_info.price !== null && (
                  <div className="space-y-2">
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-gray-500">合計</h5>
                        <h1 className="text-4xl font-bold">￥{formatPrice(Math.round(post.sale_info.price * 1.1))}</h1>
                      </div>
                    </div>
                  </div>
                )}
                {purchaseType === 'subscription' && post?.sale_info.plans.length > 0 && (
                  <div className="space-y-2">
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-gray-500">合計</h5>
                        <h1 className="text-4xl font-bold">￥{formatPrice(Math.round(post.sale_info.plans[0].price * 1.1))}</h1>
                      </div>
                    </div>
                  </div>
                )}
							</div>
						</div>

            {/* 注意事項 */}
						<div className="p-4 space-y-3 border-t border-gray-200">
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
											onCheckedChange={(checked) => setTermsChecked(checked === 'indeterminate' ? false : checked)}
										/>
										<label htmlFor="terms" className="text-sm text-gray-600">
											利用規約に同意します
										</label>
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox 
											id="privacy" 
											checked={privacyChecked}
											onCheckedChange={(checked) => setPrivacyChecked(checked === 'indeterminate' ? false : checked)}
										/>
										<label htmlFor="privacy" className="text-sm text-gray-600">
											プライバシーポリシーに同意します
										</label>
									</div>
								</div>
							</div>
						</div>
          </div>

          {/* フッター */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="space-y-3">
              <Button
                onClick={() => handleConfirm(selectedMethod)}
                disabled={!selectedMethod || !termsChecked || !privacyChecked}
                className={`w-full py-3 rounded-lg font-semibold ${
                  selectedMethod && termsChecked && privacyChecked
                    ? 'bg-primary hover:bg-primary/80 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedMethod && termsChecked && privacyChecked 
                  ? '選択した支払い方法で進む' 
                  : '支払い方法を選択し、同意事項にチェックしてください'
                }
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full py-3 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
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
