package repository

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/sirupsen/logrus"
)

type HarvestTypeRepository struct {
	Repository[entity.HarvestType]
	Log *logrus.Logger
}

func NewHarvestTypeRepository(log *logrus.Logger) *HarvestTypeRepository {
	return &HarvestTypeRepository{Log: log}
}

type ProductionCostTypeRepository struct {
	Repository[entity.ProductionCostType]
	Log *logrus.Logger
}

func NewProductionCostTypeRepository(log *logrus.Logger) *ProductionCostTypeRepository {
	return &ProductionCostTypeRepository{Log: log}
}

type WorkerRepository struct {
	Repository[entity.Worker]
	Log *logrus.Logger
}

func NewWorkerRepository(log *logrus.Logger) *WorkerRepository {
	return &WorkerRepository{Log: log}
}

type SeasonRepository struct {
	Repository[entity.Season]
	Log *logrus.Logger
}

func NewSeasonRepository(log *logrus.Logger) *SeasonRepository {
	return &SeasonRepository{Log: log}
}
