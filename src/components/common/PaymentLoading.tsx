import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';

interface PaymentLoadingProps {
  onComplete?: () => void;
  autoComplete?: boolean;
  duration?: number; // ローディング時間（ミリ秒）
}

type PaymentStatus = 'loading' | 'processing' | 'completed' | 'error';

export default function PaymentLoading({
  onComplete,
  autoComplete = true,
  duration = 5000,
}: PaymentLoadingProps) {
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [progress, setProgress] = useState(0);
  const hasCompleted = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // onCompleteをuseCallbackでメモ化
  const handleComplete = useCallback(() => {
    if (!hasCompleted.current) {
      hasCompleted.current = true;
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    // 既に実行中または完了済みの場合は何もしない
    if (!autoComplete || hasCompleted.current || timerRef.current) return;

    // タイマーをクリアする関数
    const clearAllTimers = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      if (completedTimeoutRef.current) {
        clearTimeout(completedTimeoutRef.current);
        completedTimeoutRef.current = null;
      }
    };

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearAllTimers();
          setStatus('processing');

          processingTimeoutRef.current = setTimeout(() => {
            setStatus('completed');

            completedTimeoutRef.current = setTimeout(() => {
              handleComplete();
            }, 2000);
          }, 1000);

          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    return clearAllTimers;
  }, [autoComplete, duration, handleComplete]);

  // コンポーネントがアンマウントされた時にリセット
  useEffect(() => {
    return () => {
      hasCompleted.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      if (completedTimeoutRef.current) {
        clearTimeout(completedTimeoutRef.current);
        completedTimeoutRef.current = null;
      }
    };
  }, []);

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return '決済情報を確認中...';
      case 'processing':
        return '決済を処理中...';
      case 'completed':
        return '決済が完了しました！';
      case 'error':
        return '決済に失敗しました';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
      case 'processing':
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <CreditCard className="h-16 w-16 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center space-y-6">
          {/* アイコン */}
          <div className="flex items-center justify-center">{getStatusIcon()}</div>

          {/* ステータスメッセージ */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{getStatusMessage()}</h2>
            <p className="text-sm text-gray-600">
              {status === 'loading' && 'しばらくお待ちください...'}
              {status === 'processing' && '決済処理を行っています'}
              {status === 'completed' && 'コンテンツがご利用いただけます'}
              {status === 'error' && 'もう一度お試しください'}
            </p>
          </div>

          {/* プログレスバー（ローディング中のみ表示） */}
          {(status === 'loading' || status === 'processing') && (
            <div className="w-full space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500">{progress}%</span>
              </div>
            </div>
          )}

          {/* 完了時の追加情報 */}
          {status === 'completed' && (
            <div className="bg-green-50 rounded-lg p-4 w-full">
              <div className="text-center">
                <p className="text-sm text-green-800 font-medium">決済が正常に完了しました</p>
                <p className="text-xs text-green-600 mt-1">コンテンツがご利用いただけます</p>
              </div>
            </div>
          )}

          {/* エラー時のボタン */}
          {status === 'error' && (
            <div className="w-full space-y-3">
              <button
                onClick={() => {
                  setStatus('loading');
                  setProgress(0);
                  hasCompleted.current = false;
                }}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/80 transition-colors"
              >
                再試行
              </button>
              <button
                onClick={handleComplete}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
