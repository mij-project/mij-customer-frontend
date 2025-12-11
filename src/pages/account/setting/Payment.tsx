import { useState, useEffect } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';
import { Button } from '@/components/ui/button';
import CardRegistrationDialog from '@/components/common/CardRegistrationDialog';
import { SquarePen, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserProviders, setMainCard, deleteUserProvider } from '@/api/endpoints/userProvider';
import { UserProvider } from '@/api/types/userProvider';
import { createCredixFreePayment } from '@/api/endpoints/credix';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CardData {
  id: string;
  main_card: boolean;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  brand: string;
  editAction: React.ReactNode;
  deleteAction: React.ReactNode;
}

export default function Payment() {
  const navigate = useNavigate();
  const [isCardRegistrationOpen, setIsCardRegistrationOpen] = useState(false);
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchUserProviders = async () => {
      try {
        setIsLoading(true);
        const providers = await getUserProviders();

        const formattedCards: CardData[] = providers.map((provider: UserProvider) => {
          // カードブランドを変換（M=Mastercard, V=VISA, J=JCB）
          let brandName = provider.cardbrand || 'Unknown';
          if (provider.cardbrand === 'M') {
            brandName = 'Master';
          } else if (provider.cardbrand === 'V') {
            brandName = 'VISA';
          } else if (provider.cardbrand === 'J') {
            brandName = 'JCB';
          }

          // 有効期限を分割（yukoフォーマット: "YYMM"）
          let expiryMonth = '';
          let expiryYear = '';
          if (provider.yuko && provider.yuko.length === 4) {
            expiryYear = '20' + provider.yuko.substring(2, 4); // YY -> 20YY
            expiryMonth = provider.yuko.substring(0, 2); // MM
          }

          return {
            id: provider.id,
            main_card: provider.is_main_card,
            cardNumber: `**** **** **** ${provider.cardnumber || '****'}`,
            expiryMonth,
            expiryYear,
            brand: brandName,
            editAction: <SquarePen className="w-4 h-4" />,
            deleteAction: <Trash2 className="w-4 h-4" />
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

  const handleOpenCardRegistration = () => {
    setIsCardRegistrationOpen(true);
  };

  const handleEditCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsEditDialogOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!selectedCardId) return;

    try {
      setIsProcessing(true);
      await setMainCard(selectedCardId);

      // カードリストを再取得
      const providers = await getUserProviders();
      const formattedCards: CardData[] = providers.map((provider: UserProvider) => {
        let brandName = provider.cardbrand || 'Unknown';
        if (provider.cardbrand === 'M') {
          brandName = 'Master';
        } else if (provider.cardbrand === 'V') {
          brandName = 'VISA';
        } else if (provider.cardbrand === 'J') {
          brandName = 'JCB';
        }

        let expiryMonth = '';
        let expiryYear = '';
        if (provider.yuko && provider.yuko.length === 4) {
          expiryYear = '20' + provider.yuko.substring(2, 4);
          expiryMonth = provider.yuko.substring(0, 2);
        }

        return {
          id: provider.id,
          main_card: provider.is_main_card,
          cardNumber: `**** **** **** ${provider.cardnumber || '****'}`,
          expiryMonth,
          expiryYear,
          brand: brandName,
          editAction: <SquarePen className="w-4 h-4" />,
          deleteAction: <Trash2 className="w-4 h-4" />
        };
      });

      setCardData(formattedCards);
    } catch (error) {
      console.error('メインカードの設定に失敗しました:', error);
    } finally {
      setIsProcessing(false);
      setIsEditDialogOpen(false);
      setSelectedCardId(null);
    }
  };

  const handleCardRegistration = async () => {
    try {
      // 無料決済（カード登録のみ）のセッションを作成
      const sessionData = await createCredixFreePayment();

      // 決済画面へリダイレクト
      const paymentUrl = `${sessionData.payment_url}?sid=${sessionData.session_id}`;
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('カード登録の開始に失敗しました:', error);
      alert('カード登録の開始に失敗しました。もう一度お試しください。');
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCardId) return;

    try {
      setIsProcessing(true);
      await deleteUserProvider(selectedCardId);

      // カードリストを再取得
      const providers = await getUserProviders();
      const formattedCards: CardData[] = providers.map((provider: UserProvider) => {
        let brandName = provider.cardbrand || 'Unknown';
        if (provider.cardbrand === 'M') {
          brandName = 'Master';
        } else if (provider.cardbrand === 'V') {
          brandName = 'VISA';
        } else if (provider.cardbrand === 'J') {
          brandName = 'JCB';
        }

        let expiryMonth = '';
        let expiryYear = '';
        if (provider.yuko && provider.yuko.length === 4) {
          expiryYear = '20' + provider.yuko.substring(2, 4);
          expiryMonth = provider.yuko.substring(0, 2);
        }

        return {
          id: provider.id,
          main_card: provider.is_main_card,
          cardNumber: `**** **** **** ${provider.cardnumber || '****'}`,
          expiryMonth,
          expiryYear,
          brand: brandName,
          editAction: <SquarePen className="w-4 h-4" />,
          deleteAction: <Trash2 className="w-4 h-4" />
        };
      });

      setCardData(formattedCards);
    } catch (error) {
      console.error('カードの削除に失敗しました:', error);
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
      setSelectedCardId(null);
    }
  };

  return (
    <div className="w-full max-w-screen-lg min-h-screen mx-auto bg-white space-y-6 pt-16">
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
                <p className="text-sm text-gray-600">※は決済時に利用されるカードです</p>
                {cardData.length > 0 && (
                  <Button className="mt-4" onClick={handleOpenCardRegistration}>
                    支払い方法を登録
                  </Button>
                )}
              </div>

              {cardData.length === 0 ? (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 mb-4 text-sm">登録されている支払い方法がありません</p>
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
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              <div className="flex flex-col">
                                {card.main_card && <span className="text-primary">【利用中】</span>}
                                <span className="text-gray-500">{card.cardNumber}</span>
                              </div>
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
                              <div className="flex items-center gap-4">
                                
                                <button onClick={() => handleEditCard(card.id)}>
                                  {card.editAction}
                                </button>
                                <button onClick={() => handleDeleteCard(card.id)}>
                                  {card.deleteAction}
                                </button>
                              </div>
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


        {/* カード登録用ダイアログ */}
        <CardRegistrationDialog
          isOpen={isCardRegistrationOpen}
          onClose={() => setIsCardRegistrationOpen(false)}
          onRegister={handleCardRegistration}
        />

        {/* メインカード設定確認ダイアログ */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[90%] max-w-[90%]">
            <DialogHeader>
              <DialogTitle>メインカードの設定</DialogTitle>
              <DialogDescription>
                このカードをメインカードに設定しますか？
              </DialogDescription>
            </DialogHeader>
            {selectedCardId && (() => {
              const selectedCard = cardData.find(card => card.id === selectedCardId);
              return selectedCard ? (
                <div className="my-4 p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">カード番号:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCard.cardNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">有効期限:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCard.expiryMonth}/{selectedCard.expiryYear}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ブランド:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedCard.brand}
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
            <DialogFooter className="flex-row gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isProcessing}
                className="w-24"
              >
                キャンセル
              </Button>
              <Button onClick={handleConfirmEdit} disabled={isProcessing} className="w-24">
                {isProcessing ? '処理中...' : 'はい'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* カード削除確認ダイアログ */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="w-[90%] max-w-[90%]">
            <DialogHeader>
              <DialogTitle>カードの削除</DialogTitle>
              <DialogDescription>
                こちらのカードを削除しますか？
              </DialogDescription>
            </DialogHeader>
            {selectedCardId && (() => {
              const selectedCard = cardData.find(card => card.id === selectedCardId);
              return selectedCard ? (
                <div className="my-4 p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">カード番号:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCard.cardNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">有効期限:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCard.expiryMonth}/{selectedCard.expiryYear}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ブランド:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedCard.brand}
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
            <DialogFooter className="flex-row gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isProcessing}
                className="w-24"
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                className="w-24"
              >
                {isProcessing ? '処理中...' : 'はい'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
