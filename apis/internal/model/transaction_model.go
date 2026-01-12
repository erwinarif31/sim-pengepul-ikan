package model

import "time"

type HarvestResponse struct {
	ID             string    `json:"id"`
	HarvestDate    time.Time `json:"harvest_date"`
	Weight         float64   `json:"weight"`
	Price          int       `json:"price"`
	BagangID       string    `json:"bagang_id"`
	HarvestType    string    `json:"harvest_type"`
	CreatedBy      *string   `json:"created_by"`
	CreatedByName  *string   `json:"created_by_name"`
	HarvestsSeason int       `json:"harvests_season"`
	Description    string    `json:"description"`
}

type ProductionCostResponse struct {
	ID                    string    `json:"id"`
	BagangID              string    `json:"bagang_id"`
	ProductionCostType    string    `json:"production_costs_type"`
	Price                 int       `json:"price"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
	CreatedBy             *string   `json:"created_by"`
	CreatedByName         *string   `json:"created_by_name"`
	ProductionCostsSeason int       `json:"production_costs_season"`
	CreatorRole           string    `json:"creator_role"`
}

type CreateHarvestRequest struct {
	HarvestDate string    `json:"harvest_date" validate:"required"`
	Weight      float64   `json:"weight" validate:"required,min=0"`
	Price       int       `json:"price" validate:"required,min=0"`
	BagangID    string    `json:"bagang_id" validate:"required,uuid"`
	HarvestType string    `json:"harvest_type" validate:"required"`
	Description string    `json:"description"`
}

type UpdateHarvestRequest struct {
	HarvestDate string  `json:"harvest_date"`
	Weight      float64 `json:"weight" validate:"min=0"`
	Price       int       `json:"price" validate:"min=0"`
	HarvestType string    `json:"harvest_type"`
	Description string    `json:"description"`
}

type CreateProductionCostRequest struct {
	BagangID           string `json:"bagang_id" validate:"required,uuid"`
	ProductionCostType string `json:"production_costs_type" validate:"required"`
	Price              int    `json:"price" validate:"required,min=0"`
	CreatorRole        string `json:"creator_role" validate:"required,oneof=worker owner both"`
}

type UpdateProductionCostRequest struct {
	ProductionCostType string `json:"production_costs_type"`
	Price              int    `json:"price" validate:"min=0"`
	CreatorRole        string `json:"creator_role" validate:"omitempty,oneof=worker owner both"`
}
