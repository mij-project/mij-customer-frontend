export interface PurchaseRequest {
	post_id?: string;
	plan_id: string;
}

export interface SalesData {
	withdrawable_amount: number;
	total_sales: number;
	period_sales: number;
	single_item_sales: number;
	plan_sales: number;
}

export interface SalesTransaction {
	id: string;
	date: string;
	type: 'single' | 'plan';
	title: string;
	amount: number;
	buyer: string;
}

export interface SalesTransactionsResponse {
	transactions: SalesTransaction[];
}