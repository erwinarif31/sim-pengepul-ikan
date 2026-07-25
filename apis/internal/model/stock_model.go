package model

type StockSummaryItem struct {
	BagangID       *string `json:"bagang_id"`
	BagangName     string  `json:"bagang_name"`
	HarvestType    string  `json:"harvest_type"`
	StockInKG      float64 `json:"stock_in_kg"`
	StockOutKG     float64 `json:"stock_out_kg"`
	StockBalanceKG float64 `json:"stock_balance_kg"`
	IsNegative     bool    `json:"is_negative"`
}
