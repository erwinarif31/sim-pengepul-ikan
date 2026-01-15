// Dashboard Types

export interface DashboardMetrics {
    total_harvest_revenue: number;    // Total Panen - money paid to workers/owners
    total_costs: number;              // Biaya Produksi - operational costs (informational)
    total_sales_revenue: number;      // Total Penjualan - income from selling
    total_paid: number;               // Total payments received from customers
    accounts_receivable: number;      // Piutang - unpaid sales
    net_profit: number;               // Laba Bersih - (TotalSalesRevenue - TotalHarvestRevenue)
    profit_margin: number;            // Margin % - (NetProfit / TotalSalesRevenue) * 100
    avg_profit_per_bagang: number;    // Rata-rata Laba/Bagang
    active_bagang_count: number;      // Jumlah Bagang Aktif
}

export interface HarvestTrendItem {
    month: string;
    revenue: number;
}

export interface HarvestTrendResponse {
    data: HarvestTrendItem[];
}

export interface HarvestByTypeItem {
    type: string;
    total: number;
}

export interface HarvestByTypeResponse {
    data: HarvestByTypeItem[];
}

export interface BagangPerformanceItem {
    bagang_id: string;
    bagang_name: string;
    revenue: number;
    cost: number;
    profit: number;
}

export interface BagangPerformanceResponse {
    data: BagangPerformanceItem[];
}

export interface RecentSaleItem {
    id: number;
    customer: string;
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
