package converter

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
)

func HarvestTypeToResponse(e *entity.HarvestType) *model.HarvestTypeResponse {
	return &model.HarvestTypeResponse{Name: e.Name}
}

func ProductionCostTypeToResponse(e *entity.ProductionCostType) *model.ProductionCostTypeResponse {
	return &model.ProductionCostTypeResponse{Name: e.Name}
}

func WorkerToResponse(e *entity.Worker) *model.WorkerResponse {
	return &model.WorkerResponse{ID: e.ID, Name: e.Name}
}

func SeasonToResponse(e *entity.Season) *model.SeasonResponse {
	return &model.SeasonResponse{
		ID:        e.ID,
		StartDate: e.StartDate,
		EndDate:   e.EndDate,
	}
}
