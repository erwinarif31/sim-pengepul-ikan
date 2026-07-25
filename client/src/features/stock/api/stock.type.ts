export type StockSummaryItem = {
    bagang_id: string | null;
    bagang_name: string;
    harvest_type: string;
    stock_in_kg: number;
    stock_out_kg: number;
    stock_balance_kg: number;
    is_negative: boolean;
};

export type StockSummaryQuery = {
    seasonId: number;
    bagangId?: string;
    harvestType?: string;
    startDate?: string;
    endDate?: string;
};

export type StockSummaryApiResponse = {
    data: StockSummaryItem[];
};
