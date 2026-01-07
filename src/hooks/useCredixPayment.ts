/**
 * CREDIX決済処理カスタムフック
 */
import { useState, useCallback } from 'react';
import { createCredixSession, getCredixPaymentResult } from '@/api/endpoints/credix';
import {
  CredixSessionRequest,
  CredixSessionResponse,
  CredixPaymentResultResponse,
  PurchaseType,
} from '@/api/types/credix';

interface UseCredixPaymentReturn {
  /** セッション作成中フラグ */
  isCreatingSession: boolean;
  /** 決済結果取得中フラグ */
  isFetchingResult: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** セッション情報 */
  sessionData: CredixSessionResponse | null;
  /** 決済結果 */
  paymentResult: CredixPaymentResultResponse | null;
  /** セッション作成関数 */
  createSession: (params: CreateSessionParams) => Promise<void>;
  /** 決済結果確認関数 */
  fetchPaymentResult: (transactionId: string) => Promise<void>;
  /** エラークリア */
  clearError: () => void;
  /** 状態リセット */
  reset: () => void;
}

interface CreateSessionParams {
  /** コンテンツID */
  orderId: string;
  /** 購入タイプ */
  purchaseType: PurchaseType;
  /** プランID（サブスクリプションの場合） */
  planId?: string;
  /** 単発購入価格（単発購入の場合） */
  priceId?: string;
  /** セール中フラグ */
  is_time_sale?: boolean;
}

/**
 * CREDIX決済処理フック
 */
export const useCredixPayment = (): UseCredixPaymentReturn => {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isFetchingResult, setIsFetchingResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<CredixSessionResponse | null>(null);
  const [paymentResult, setPaymentResult] = useState<CredixPaymentResultResponse | null>(null);

  /**
   * CREDIXセッション作成
   */
  const createSession = useCallback(async (params: CreateSessionParams) => {
    setIsCreatingSession(true);
    setError(null);

    try {
      const request: CredixSessionRequest = {
        order_id: params.orderId,
        purchase_type: params.purchaseType,
        plan_id: params.planId,
        price_id: params.priceId,
        is_time_sale: params.is_time_sale,
      };

      const response = await createCredixSession(request);

      setSessionData(response);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || '決済セッションの作成に失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreatingSession(false);
    }
  }, []);

  /**
   * 決済結果確認
   */
  const fetchPaymentResult = useCallback(async (transactionId: string) => {
    setIsFetchingResult(true);
    setError(null);

    try {
      const response = await getCredixPaymentResult(transactionId);
      setPaymentResult(response);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || '決済結果の取得に失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setIsFetchingResult(false);
    }
  }, []);

  /**
   * エラークリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 状態リセット
   */
  const reset = useCallback(() => {
    setIsCreatingSession(false);
    setIsFetchingResult(false);
    setError(null);
    setSessionData(null);
    setPaymentResult(null);
  }, []);

  return {
    isCreatingSession,
    isFetchingResult,
    error,
    sessionData,
    paymentResult,
    createSession,
    fetchPaymentResult,
    clearError,
    reset,
  };
};
