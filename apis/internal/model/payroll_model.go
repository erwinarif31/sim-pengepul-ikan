package model

import "time"

type PayrollRowResponse struct {
	WorkerID        string     `json:"worker_id"`
	WorkerName      string     `json:"worker_name"`
	BagangID        string     `json:"bagang_id"`
	BagangName      string     `json:"bagang_name"`
	SeasonID        int        `json:"season_id"`
	SeasonStartDate time.Time  `json:"season_start_date"`
	SeasonEndDate   *time.Time `json:"season_end_date"`
}

type PayrollResponse struct {
	WorkerID            string   `json:"worker_id"`
	WorkerName          string   `json:"worker_name"`
	TotalHarvestRevenue int      `json:"total_harvest_revenue"`
	TotalSharedCost     int      `json:"total_shared_cost"`
	TotalSelfCost       int      `json:"total_self_cost"`
	NetPayroll          int      `json:"net_payroll"`
	BagangNames         []string `json:"bagang_names"`
}
