import { useState } from 'react';
import AccountHeader from '@/features/account/component/AccountHeader';
import { Button } from '@/components/ui/button';
import PaymentDialog from '@/components/common/PaymentDialog';
import CreditPaymentDialog from '@/components/common/CreditPaymentDialog';
import { PostDetailData } from '@/api/types/post';

const mockCardData = [
  {
    cardNumber: '**** **** **** 9999',
    expiryMonth: '10',
    expiryYear: '2028',
    brand: 'Visa',
    action: '削除',
  },
];

export default function Payment() {
  const [isOpen, setIsOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'single' | 'subscription' | null>(null);
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [cardData, setCardData] = useState(mockCardData);

  const handleOpenPaymentDialog = () => {
    setIsOpen(true);
  };

  const handlePayment = () => {
    // 実際の決済処理をここに実装
    console.log('Payment processing...');

    // 決済成功後、新しいカード情報を追加（モックデータ）
    const newCard = {
      cardNumber: '**** **** **** 1234',
      expiryMonth: '12',
      expiryYear: '2029',
      brand: 'Mastercard',
      action: '削除',
    };

    setCardData((prev) => [...prev, newCard]);
    setIsOpen(false);
  };

  const handleDeleteCard = (cardNumber: string) => {
    setCardData((prev) => prev.filter((card) => card.cardNumber !== cardNumber));
  };

  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader title="支払い方法" showBackButton={false} />
      <div className="p-6 space-y-6 mt-16">
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">支払い方法</h2>
          <p className="text-sm text-gray-600">支払い方法を登録</p>
        </div>
        <div className="space-y-4 w-full">
          <Button className="mt-4" onClick={handleOpenPaymentDialog}>
            支払い方法を登録
          </Button>
        </div>

        {/* カード情報をテーブル形式で表示する 　*/}
        <div className="space-y-4">
          <div className="text-left mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">登録済みカード</h2>
            <p className="text-sm text-gray-600">登録されているクレジットカード情報</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カード番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      有効期限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ブランド
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cardData.map((card) => (
                    <tr key={card.cardNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {card.cardNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {card.expiryMonth}/{card.expiryYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {card.brand}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          className="text-red-600 hover:text-red-900 font-medium"
                          onClick={() => handleDeleteCard(card.cardNumber)}
                        >
                          {card.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ボタン押下時にクレジット入力ダイアログを表示 */}
        <CreditPaymentDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          post={post}
          onPayment={handlePayment}
          purchaseType={purchaseType}
        />
      </div>
    </div>
  );
}
