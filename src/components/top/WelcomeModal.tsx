import { Button } from '@/components/ui/button';
interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleMoveToCreatorRequest: () => void;
}

export default function WelcomeModal({
  isOpen,
  onClose,
  handleMoveToCreatorRequest,
}: WelcomeModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4 animate-fade-in">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">メール認証完了</h2>
          <p className="text-gray-600 mb-6">
            メールアドレスの認証が完了しました。
            <br />
            ご登録誠にありがとうございます。
            <br />
            mijfansへようこそ！
            <br />
            このままクリエイター登録へ進みますか？
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              いいえ
            </Button>
            <Button onClick={handleMoveToCreatorRequest} variant="default" className="flex-1">
              はい
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
