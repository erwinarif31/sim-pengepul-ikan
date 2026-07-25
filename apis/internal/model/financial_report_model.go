package model

import "time"

type FinancialSaleItem struct {
	ID                 int       `json:"id"`
	Customer           string    `json:"customer"`
	BagangName         string    `json:"bagang_name"`
	IssuedAt           time.Time `json:"issued_at"`
	TotalSalesRevenue  int       `json:"total_sales_revenue"`
	TotalPaid          int       `json:"total_paid"`
	AccountsReceivable int       `json:"accounts_receivable"`
}

type FinancialProductionCostItem struct {
	ID                 string    `json:"id"`
	BagangID           string    `json:"bagang_id"`
	BagangName         string    `json:"bagang_name"`
	ProductionCostType string    `json:"production_costs_type"`
	CreatedAt          time.Time `json:"created_at"`
	Amount             int       `json:"amount"`
}

type FinancialReportResponse struct {
	TotalSalesRevenue   int                           `json:"total_sales_revenue"`
	TotalPaid           int                           `json:"total_paid"`
	AccountsReceivable  int                           `json:"accounts_receivable"`
	TotalProductionCost int                           `json:"total_production_cost"`
	NetProfit           int                           `json:"net_profit"`
	ProfitMargin        float64                       `json:"profit_margin"`
	Sales               []FinancialSaleItem           `json:"sales"`
	ProductionCosts     []FinancialProductionCostItem `json:"production_costs"`
}
