package model

// DashboardMetricsResponse represents the KPI overview cards
type DashboardMetricsResponse struct {
	TotalHarvestValue  int     `json:"total_harvest_value"`
	TotalCosts         int     `json:"total_costs"`
	TotalSalesRevenue  int     `json:"total_sales_revenue"`
	TotalPaid          int     `json:"total_paid"`
	AccountsReceivable int     `json:"accounts_receivable"`
	NetProfit          int     `json:"net_profit"`
	ProfitMargin       float64 `json:"profit_margin"`
	AvgProfitPerBagang int     `json:"avg_profit_per_bagang"`
	ActiveBagangCount  int     `json:"active_bagang_count"`
}

type HarvestTrendItem struct {
	Month        string `json:"month"`
	HarvestValue int    `json:"harvest_value"`
}

type HarvestTrendResponse struct {
	Data []HarvestTrendItem `json:"data"`
}

type HarvestByTypeItem struct {
	Type         string `json:"type"`
	HarvestValue int    `json:"harvest_value"`
}

type HarvestByTypeResponse struct {
	Data []HarvestByTypeItem `json:"data"`
}

type BagangPerformanceItem struct {
	BagangID       *string `json:"bagang_id"`
	BagangName     string  `json:"bagang_name"`
	HarvestValue   int     `json:"harvest_value"`
	SalesRevenue   int     `json:"sales_revenue"`
	ProductionCost int     `json:"production_cost"`
	NetProfit      int     `json:"net_profit"`
}

type BagangPerformanceResponse struct {
	Data []BagangPerformanceItem `json:"data"`
}

type RecentSaleItem struct {
	ID          int    `json:"id"`
	Customer    string `json:"customer"`
	BagangName  string `json:"bagang_name"`
	IssuedAt    string `json:"issued_at"`
	TotalAmount int    `json:"total_amount"`
	TotalPaid   int    `json:"total_paid"`
	IsPaidOff   bool   `json:"is_paid_off"`
}

// RecentSalesResponse represents recent sales list
type RecentSalesResponse struct {
	Data []RecentSaleItem `json:"data"`
}
