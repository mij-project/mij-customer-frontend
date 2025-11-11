import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AlertProps {
  /** アラートの表示状態 */
  isOpen: boolean;
  /** タイトル */
  title: string;
  /** 説明文 */
  description: string;
  /** 閉じる時のコールバック */
  onClose: () => void;
  /** ボタンのテキスト（デフォルト: "了解"） */
  buttonText?: string;
}

/**
 * 共通アラートコンポーネント
 *
 * @example
 * ```tsx
 * const [isAlertOpen, setIsAlertOpen] = useState(false);
 *
 * <Alert
 *   isOpen={isAlertOpen}
 *   title="スクリーンショットを検知しました"
 *   description="当サービスにおいて、無断転載の固定となるスクリーンショットを行うことは禁止しております。"
 *   onClose={() => setIsAlertOpen(false)}
 * />
 * ```
 */
export default function Alert({
  isOpen,
  title,
  description,
  onClose,
  buttonText = '了解',
}: AlertProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* アラートモーダル */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* アイコン */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </div>

          {/* タイトル */}
          <h2 className="text-center text-md font-bold text-gray-900 mb-4">{title}</h2>

          {/* 説明文 */}
          <p className="text-center text-sm text-gray-600 leading-relaxed mb-8">{description}</p>

          {/* ボタン */}
          <button
            onClick={onClose}
            className="w-full py-3 px-6 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary hover:text-white transition-colors duration-200 active:scale-95"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </>
  );
}
