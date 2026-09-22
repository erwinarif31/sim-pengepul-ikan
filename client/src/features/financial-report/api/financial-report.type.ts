export type FinancialSaleItem = {
    id: number;
    customer: string;
    bagang_name: string;
    issued_at: string;
    total_sales_revenue: number;
    total_paid: number;
    accounts_receivable: number;
};

export type FinancialProductionCostItem = {
    id: string;
    bagang_id: string;
    bagang_name: string;
    production_costs_type: string;
    created_at: string;
    amount: number;
};

export type FinancialReport = {
    total_harvest_value: number;
    total_sales_revenue: number;
    total_paid: number;
    accounts_receivable: number;
    total_production_cost: number;
    net_profit: number;
    profit_margin: number;
    sales: FinancialSaleItem[];
    production_costs: FinancialProductionCostItem[];
};

export type FinancialReportQuery = {
    seasonId: number;
    bagangId?: string;
    startDate?: string;
    endDate?: string;
};

export type FinancialReportApiResponse = {
    data: FinancialReport;
};
