package model

import "time"

type HarvestTypeResponse struct {
	Name string `json:"name"`
}

type ProductionCostTypeResponse struct {
	Name string `json:"name"`
}

type WorkerResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SeasonResponse struct {
	ID        int        `json:"id"`
	StartDate time.Time  `json:"start_date"`
	EndDate   *time.Time `json:"end_date"`
}

type CreateMasterDataRequest struct {
	Name string `json:"name" validate:"required"`
}