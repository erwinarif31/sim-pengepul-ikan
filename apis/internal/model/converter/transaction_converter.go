package converter

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
)

func HarvestToResponse(harvest *entity.Harvest) *model.HarvestResponse {
	return &model.HarvestResponse{
		ID:             harvest.ID,
		HarvestDate:    harvest.HarvestDate,
		Weight:         harvest.Weight,
		Price:          harvest.Price,
		BagangID:       harvest.BagangID,
		HarvestType:    harvest.HarvestType,
		CreatedBy:      harvest.CreatedBy,
		CreatedByName:  harvest.CreatedByName,
		HarvestsSeason: harvest.HarvestsSeason,
		Description:    harvest.Description,
	}
}

func ProductionCostToResponse(cost *entity.ProductionCost) *model.ProductionCostResponse {
	return &model.ProductionCostResponse{
		ID:                    cost.ID,
		BagangID:              cost.BagangID,
		ProductionCostType:    cost.ProductionCostType,
		Price:                 cost.Price,
		CreatedAt:             cost.CreatedAt,
		UpdatedAt:             cost.UpdatedAt,
		CreatedBy:             cost.CreatedBy,
		CreatedByName:         cost.CreatedByName,
		ProductionCostsSeason: cost.ProductionCostsSeason,
		CreatorRole:           cost.CreatorRole,
	}
}
