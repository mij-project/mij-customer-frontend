export interface TimeSalePriceInfo {
    id: string
    post_id: string
    plan_id: string | null
    price_id: string | null
    start_date: string
    end_date: string
    sale_percentage: number
    max_purchase_count: number | null
    purchase_count: number
    is_active: boolean
    is_expired: boolean
    created_at: string
}

export interface TimeSalePriceInfoResponse {
    time_sales: TimeSalePriceInfo[]
    total: number
    total_pages: number
    page: number
    limit: number
    has_next: boolean
}

export interface TimeSalePlanInfo {
    id: string
    post_id: string | null
    plan_id: string
    price_id: string | null
    start_date: string
    end_date: string
    sale_percentage: number
    max_purchase_count: number | null
    purchase_count: number
    is_active: boolean
    is_expired: boolean
    created_at: string
}

export interface TimeSalePlanInfoResponse {
    time_sales: TimeSalePlanInfo[]
    total: number
    total_pages: number
    page: number
    limit: number
    has_next: boolean
}