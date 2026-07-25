// Dashboard Types

export interface DashboardMetrics {
    total_harvest_value: number;
    total_costs: number;
    total_sales_revenue: number;
    total_paid: number;
    accounts_receivable: number;
    net_profit: number;
    profit_margin: number;
    avg_profit_per_bagang: number;
    active_bagang_count: number;
}

export interface HarvestTrendItem {
    month: string;
    harvest_value: number;
}

export interface HarvestTrendResponse {
    data: HarvestTrendItem[];
}

export interface HarvestByTypeItem {
    type: string;
    harvest_value: number;
}

export interface HarvestByTypeResponse {
    data: HarvestByTypeItem[];
}

export interface BagangPerformanceItem {
    bagang_id: string | null;
    bagang_name: string;
    harvest_value: number;
    sales_revenue: number;
    production_cost: number;
    net_profit: number;
}

export interface BagangPerformanceResponse {
    data: BagangPerformanceItem[];
}

export interface RecentSaleItem {
    id: number;
    customer: string;
    bagang_name: string;
    issued_at: string;
    total_amount: number;
    total_paid: number;
    is_paid_off: boolean;
}

export interface RecentSalesResponse {
    data: RecentSaleItem[];
}

// API Response wrapper
export interface DashboardApiResponse<T> {
    data: T;
}
