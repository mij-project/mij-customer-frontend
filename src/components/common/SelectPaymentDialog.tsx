import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, CreditCard, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { PostDetailData } from '@/api/types/post';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post?: PostDetailData;
  onPayment?: () => void;
  onPurchaseTypeSelect?: (type: 'single' | 'subscription') => void;
}

export default function SelectPaymentDialog({
  isOpen,
  onClose,
  post,
  onPayment,
  onPurchaseTypeSelect,
}: PaymentDialogProps) {
  // 購入タイプ（single or subscription）
  const [selectedPurchaseType, setSelectedPurchaseType] = useState<'single' | 'subscription' | ''>('');

  // 決済方法（常にクレジットカード）
  const [selectedMethod] = useState<string>('credit_card');

  // 同意チェックボックス
  const [termsChecked, setTermsChecked] = useState(false);
  const [emv3dSecureConsent, setEmv3dSecureConsent] = useState(false);

  // プラン詳細アコーディオンの状態
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // ダイアログが開いた時にデフォルト選択を設定
  useEffect(() => {
    if (isOpen && post) {
      const hasSinglePurchase = post.sale_info.price !== null && post.sale_info.price.price > 0;
      const hasSubscription = post.sale_info.plans.length > 0;

      let defaultType: 'single' | 'subscription' | '' = '';

      // 単品とプラン両方がある場合は単品をデフォルト選択
      if (hasSinglePurchase && hasSubscription) {
        defaultType = 'single';
      }
      // プランのみの場合はプランをデフォルト選択
      else if (!hasSinglePurchase && hasSubscription) {
        defaultType = 'subscription';
      }
      // 単品のみの場合は単品をデフォルト選択
      else if (hasSinglePurchase && !hasSubscription) {
        defaultType = 'single';
      }

      if (defaultType) {
        setSelectedPurchaseType(defaultType);
        if (onPurchaseTypeSelect) {
          onPurchaseTypeSelect(defaultType);
        }
      }
    } else if (!isOpen) {
      // ダイアログが閉じられた時にリセット
      setSelectedPurchaseType('');
      setTermsChecked(false);
      setEmv3dSecureConsent(false);
    }
  }, [isOpen, post]);

  // サムネイル画像を取得
  const thumbnail = post?.thumbnail_key || '';

  // 購入タイプ選択時のハンドラー
  const handlePurchaseTypeChange = (value: string) => {
    const type = value as 'single' | 'subscription';
    setSelectedPurchaseType(type);
    if (onPurchaseTypeSelect) {
      onPurchaseTypeSelect(type);
    }
  };

  // 決済ボタンを押したときの処理
  const handlePayment = () => {
    if (onPayment) {
      onPayment();
    }
  };

  // ダイアログを閉じる際にリセット
  const handleClose = () => {
    setSelectedPurchaseType('');
    setTermsChecked(false);
    setEmv3dSecureConsent(false);
    onClose();
  };

  // フォームが有効かチェック（購入タイプ選択 + 利用規約同意 + EMV 3-D Secure同意）
  const isFormValid = selectedPurchaseType && termsChecked && emv3dSecureConsent;

  // 選択された金額を計算
  const getSelectedAmount = () => {
    if (!post) return 0;
    if (selectedPurchaseType === 'single' && post.sale_info.price) {
      return Math.round(post.sale_info.price.price * 1.1);
    }
    if (selectedPurchaseType === 'subscription' && post.sale_info.plans.length > 0) {
      return Math.round(post.sale_info.plans[0].price * 1.1);
    }
    return 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-[1000]" />
      <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 w-full max-w-full md:max-w-md md:mx-auto md:left-1/2 md:right-auto md:-translate-x-1/2 h-auto max-h-[85vh] rounded-t-2xl md:rounded-2xl border-0 bg-white p-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300 z-[1000] overflow-x-hidden">
        <DialogTitle className="sr-only">購入方法選択</DialogTitle>
        <DialogDescription className="sr-only">
          購入方法と決済方法を選択し、利用規約に同意してください
        </DialogDescription>

        <div className="flex flex-col max-h-[85vh] overflow-hidden">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 flex-1 min-w-0 pr-2">購入方法選択</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1 h-auto w-auto hover:bg-gray-100 rounded-full flex-shrink-0"
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-4">
            {post && (
              <>
                {/* 投稿情報 */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex space-x-3">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                      <h3 className="font-medium text-gray-900 text-sm break-words line-clamp-2 mt-1">
                        {post.description || 'コンテンツ'}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* 購入方法選択（ラジオボタン） */}
                <div className="px-4 py-4 space-y-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">購入方法を選択</h3>
                  <div className="space-y-3">
                    {/* 単品購入オプション */}
                    {post.sale_info.price !== null && post.sale_info.price.price > 0 && (
                      <div
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handlePurchaseTypeChange('single')}
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedPurchaseType === 'single'
                                ? 'border-primary bg-primary'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedPurchaseType === 'single' && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">単品購入</p>
                            <p className="text-xs text-gray-600">このコンテンツのみ購入</p>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            ¥{formatPrice(post.sale_info.price.price)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* プラン加入オプション */}
                    {post.sale_info.plans.length > 0 &&
                      post.sale_info.plans.map((plan, index) => {
                        const isExpanded = expandedPlanId === plan.id;
                        return (
                          <div key={plan.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* プラン選択部分 */}
                            <div
                              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handlePurchaseTypeChange('subscription')}
                            >
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedPurchaseType === 'subscription'
                                      ? 'border-primary bg-primary'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {selectedPurchaseType === 'subscription' && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 line-clamp-2">{plan.name}</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900 whitespace-nowrap flex-shrink-0">
                                  ¥{formatPrice(plan.price)}/月
                                </p>
                              </div>
                            </div>

                            {/* 詳細を確認ボタン */}
                            <div className="px-3 pb-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedPlanId(isExpanded ? null : plan.id);
                                }}
                                className="flex items-center justify-center w-full py-2 text-xs text-primary hover:text-primary/80 transition-colors"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    詳細を閉じる
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                    詳細を確認
                                  </>
                                )}
                              </button>
                            </div>

                            {/* アコーディオンコンテンツ */}
                            {isExpanded && (
                              <div className="px-3 pb-3 border-t border-gray-200 bg-gray-50">
                                {/* サムネイル表示 */}
                                {plan.plan_post && plan.plan_post.length > 0 && (
                                  <div className="mt-3">
                                    <h4 className="text-xs font-medium text-gray-700 mb-2">他にもこんな投稿があります！</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                      {plan.plan_post.slice(0, 3).map((post, idx) => (
                                        <div key={idx} className="flex flex-col">
                                          <div className="aspect-square rounded-md overflow-hidden bg-gray-200">
                                            <img
                                              src={post.thumbnail_url}
                                              alt={post.description}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                          <p className="mt-1 text-xs text-gray-600 line-clamp-2 break-words">
                                            {post.description}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* プラン説明全文 */}
                                {plan.description && (
                                  <div className="mt-3">
                                    <h4 className="text-xs font-medium text-gray-700 mb-2">プラン説明</h4>
                                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{plan.description}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
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
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                      {selectedPurchaseType ? `¥${formatPrice(getSelectedAmount())}` : '—'}
                    </h1>
                  </div>
                </div>

                {/* 注意事項と同意チェックボックス */}
                <div className="px-4 py-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">ご注意事項</h3>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-800">
                      <ul className="space-y-1 text-xs">
                        <li>• 決済完了後、即座にコンテンツがご利用いただけます</li>
                        <li>• 一度購入したコンテンツは無期限で視聴可能です</li>
                        <li>• コンテンツのダウンロードはできません</li>
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
                </div>
              </>
            )}
          </div>

          {/* フッター */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="space-y-3">
              <Button
                onClick={handlePayment}
                disabled={!isFormValid}
                className={`w-full py-3 rounded-lg font-semibold text-sm sm:text-base ${
                  isFormValid
                    ? 'bg-primary hover:bg-primary/80 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isFormValid
                  ? '決済画面へ進む'
                  : '購入方法を選択し、利用規約に同意してください'}
              </Button>

              <Button
                variant="outline"
                onClick={handleClose}
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
