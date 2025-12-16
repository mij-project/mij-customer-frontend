export interface PurchaseRequest {
  item_type: 'single' | 'subscription';
  post_id?: string;
  plan_id: string;
}

export interface SalesPeriodData {
  period_sales: number;
  single_item_sales: number;
  plan_sales: number;
  previous_period_sales: number;
}

export interface SalesHistory {
  id: number;
  payment_price: number;
  payment_type: number;
  paid_at: string;
  buyer_username: string;
  single_post_id: string;
  plan_id: string;
  plan_name: string;
  single_post_description?: string;
}

export interface SalesHistoryResponse {
  sales_history: SalesHistory[];
  has_next: boolean;
  has_previous: boolean;
  total_pages: number;
}

export interface SalesSummary {
  cumulative_sales: number;
  withdrawable_amount: number;
}

export interface WithdrawalApplicationRequest {
  user_bank_id: string;
  withdraw_amount: number;
  transfer_amount: number;
}