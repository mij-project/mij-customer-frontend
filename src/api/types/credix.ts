/**
 * CREDIX決済関連の型定義
 */

/**
 * 購入タイプ
 */
export enum PurchaseType {
  /** 単発購入 */
  SINGLE = "single",
  /** サブスクリプション */
  SUBSCRIPTION = "subscription"
}

/**
 * CREDIXセッション作成リクエスト
 */
export interface CredixSessionRequest {
  /** 投稿ID */
  post_id: string;
  /** 購入タイプ */
  purchase_type: PurchaseType;
  /** プランID（サブスクリプションの場合必須） */
  plan_id?: string;
  /** 単発購入価格（単発購入の場合必須） */
  price_id?: string;
  /** 電話番号 */
  telno: string;
}

/**
 * CREDIXセッション作成レスポンス
 */
export interface CredixSessionResponse {
  /** CREDIXセッションID */
  session_id: string;
  /** CREDIX決済画面URL */
  payment_url: string;
  /** トランザクションID */
  transaction_id: string;
  /** 初回決済フラグ */
  is_first_payment: boolean;
}

/**
 * CREDIX決済結果ステータス
 */
export type PaymentStatus = "pending" | "completed" | "failed";

/**
 * CREDIX決済結果
 */
export type PaymentResult = "pending" | "success" | "failure";

/**
 * CREDIX決済結果レスポンス
 */
export interface CredixPaymentResultResponse {
  /** ステータス */
  status: PaymentStatus;
  /** 決済結果 */
  result: PaymentResult;
  /** トランザクションID */
  transaction_id: string;
  /** 決済ID（成功時のみ） */
  payment_id?: string;
  /** サブスクリプションID（成功時のみ） */
  subscription_id?: string;
}

/**
 * CREDIX決済エラー
 */
export interface CredixPaymentError {
  /** エラーメッセージ */
  message: string;
  /** エラーコード（オプション） */
  code?: string;
}
