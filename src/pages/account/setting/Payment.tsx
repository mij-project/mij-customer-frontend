import { useState, useEffect } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';
import { Button } from '@/components/ui/button';
import PaymentDialog from '@/components/common/PaymentDialog';
import CreditPaymentDialog from '@/components/common/CreditPaymentDialog';
import { PostDetailData } from '@/api/types/post';
import { useNavigate } from 'react-router-dom';
import { getUserProviders } from '@/api/endpoints/userProvider';
import { UserProvider } from '@/api/types/userProvider';

interface CardData {
  id: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  brand: string;
  action: string;
}

export default function Payment() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'single' | 'subscription' | null>(null);
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProviders = async () => {
      try {
        setIsLoading(true);
        const providers = await getUserProviders();

        const formattedCards: CardData[] = providers.map((provider: UserProvider) => {
          // カードブランドを変換（M=Mastercard, V=VISA, J=JCB）
          let brandName = provider.cardbrand || 'Unknown';
          if (provider.cardbrand === 'M') {
            brandName = 'Mastercard';
          } else if (provider.cardbrand === 'V') {
            brandName = 'VISA';
          } else if (provider.cardbrand === 'J') {
            brandName = 'JCB';
          }

          // 有効期限を分割（yukoフォーマット: "YYMM"）
          let expiryMonth = '';
          let expiryYear = '';
          if (provider.yuko && provider.yuko.length === 4) {
            expiryYear = '20' + provider.yuko.substring(0, 2); // YY -> 20YY
            expiryMonth = provider.yuko.substring(2, 4); // MM
          }

          return {
            id: provider.id,
            cardNumber: `**** **** **** ${provider.cardnumber || '****'}`,
            expiryMonth,
            expiryYear,
            brand: brandName,
            action: '削除',
          };
        });

        setCardData(formattedCards);
      } catch (error) {
        console.error('決済情報の取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProviders();
  }, []);

  const handleOpenPaymentDialog = () => {
    setIsOpen(true);
  };

  const handlePayment = () => {
    // 実際の決済処理をここに実装
    setIsOpen(false);
    // 決済成功後、リロードして最新のデータを取得
    window.location.reload();
  };

  const handleDeleteCard = (cardId: string) => {
    // TODO: 実際の削除API呼び出しを実装
    setCardData((prev) => prev.filter((card) => card.id !== cardId));
  };

  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader
        title="支払い方法"
        showBackButton={true}
        onBack={() => navigate('/account/settings')}
      />
      <div className="p-6 space-y-6 mt-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : (
          <>
            {/* カード情報をテーブル形式で表示する */}
            <div className="space-y-4">
              <div className="text-left mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">登録済みカード</h2>
                <p className="text-sm text-gray-600">登録されているクレジットカード情報</p>
                {cardData.length > 0 && (
                  <Button className="mt-4" onClick={handleOpenPaymentDialog}>
                    支払い方法を登録
                  </Button>
                )}
              </div>

              {cardData.length === 0 ? (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 mb-4">登録されている支払い方法がありません</p>
                </div>
              ) : (
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
                          <tr key={card.id} className="hover:bg-gray-50">
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
                                onClick={() => handleDeleteCard(card.id)}
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
              )}
            </div>
          </>
        )}

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
