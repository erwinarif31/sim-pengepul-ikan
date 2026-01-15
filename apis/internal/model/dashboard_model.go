package model

// DashboardMetricsResponse represents the KPI overview cards
type DashboardMetricsResponse struct {
	TotalHarvestRevenue  int     `json:"total_harvest_revenue"`  // Total Panen - money paid to workers/owners
	TotalCosts           int     `json:"total_costs"`            // Biaya Produksi - operational costs (informational, subset of harvest)
	TotalSalesRevenue    int     `json:"total_sales_revenue"`    // Total Penjualan - income from selling
	TotalPaid            int     `json:"total_paid"`             // Total payments received from customers
	AccountsReceivable   int     `json:"accounts_receivable"`    // Piutang - unpaid sales (TotalSalesRevenue - TotalPaid)
	NetProfit            int     `json:"net_profit"`             // Laba Bersih - (TotalSalesRevenue - TotalHarvestRevenue)
	ProfitMargin         float64 `json:"profit_margin"`          // Margin % - (NetProfit / TotalSalesRevenue) * 100
	AvgProfitPerBagang   int     `json:"avg_profit_per_bagang"`  // Rata-rata Laba/Bagang
	ActiveBagangCount    int     `json:"active_bagang_count"`    // Jumlah Bagang Aktif (with harvests in season)
}

// HarvestTrendItem represents a single month's harvest data
type HarvestTrendItem struct {
	Month   string `json:"month"`
	Revenue int    `json:"revenue"`
}

// HarvestTrendResponse represents monthly harvest revenue trend
type HarvestTrendResponse struct {
	Data []HarvestTrendItem `json:"data"`
}

// HarvestByTypeItem represents harvest revenue for a specific type
type HarvestByTypeItem struct {
	Type  string `json:"type"`
	Total int    `json:"total"`
}

// HarvestByTypeResponse represents harvest breakdown by type
type HarvestByTypeResponse struct {
	Data []HarvestByTypeItem `json:"data"`
}

// BagangPerformanceItem represents a bagang's performance metrics
type BagangPerformanceItem struct {
	BagangID   string `json:"bagang_id"`
	BagangName string `json:"bagang_name"`
	Revenue    int    `json:"revenue"`
	Cost       int    `json:"cost"`
	Profit     int    `json:"profit"`
}

// BagangPerformanceResponse represents top bagangs by performance
type BagangPerformanceResponse struct {
	Data []BagangPerformanceItem `json:"data"`
}

// RecentSaleItem represents a recent sale entry
type RecentSaleItem struct {
	ID          int    `json:"id"`
	Customer    string `json:"customer"`
	IssuedAt    string `json:"issued_at"`
	TotalAmount int    `json:"total_amount"`
	TotalPaid   int    `json:"total_paid"`
	IsPaidOff   bool   `json:"is_paid_off"`
}

// RecentSalesResponse represents recent sales list
type RecentSalesResponse struct {
	Data []RecentSaleItem `json:"data"`
}
