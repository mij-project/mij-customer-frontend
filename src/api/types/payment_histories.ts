export interface PaymentHistory {
    id: string;
    payment_amount: number;
    payment_type: number;
    payment_status: number;
    paid_at: string;
    buyer_username: string;
    single_post_id: string;
    plan_id: string;
    plan_name: string;
}