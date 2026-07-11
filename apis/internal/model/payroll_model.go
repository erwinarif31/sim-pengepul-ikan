package model

type PayrollResponse struct {
	WorkerID            string   `json:"worker_id"`
	WorkerName          string   `json:"worker_name"`
	TotalHarvestRevenue int      `json:"total_harvest_revenue"`
	TotalSharedCost     int      `json:"total_shared_cost"`
	TotalSelfCost       int      `json:"total_self_cost"`
	NetPayroll          int      `json:"net_payroll"`
	BagangNames         []string `json:"bagang_names"`
}
