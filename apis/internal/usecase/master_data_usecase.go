package usecase

import (
	"context"
	"time"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/model/converter"
	"github.com/erwinarif31/catchery-api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type MasterDataUseCase struct {
	DB                           *gorm.DB
	Log                          *logrus.Logger
	HarvestTypeRepository        *repository.HarvestTypeRepository
	ProductionCostTypeRepository *repository.ProductionCostTypeRepository
	WorkerRepository             *repository.WorkerRepository
	SeasonRepository             *repository.SeasonRepository
}

func NewMasterDataUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	harvestTypeRepo *repository.HarvestTypeRepository,
	productionCostTypeRepo *repository.ProductionCostTypeRepository,
	workerRepo *repository.WorkerRepository,
	seasonRepo *repository.SeasonRepository,
) *MasterDataUseCase {
	return &MasterDataUseCase{
		DB:                           db,
		Log:                          log,
		HarvestTypeRepository:        harvestTypeRepo,
		ProductionCostTypeRepository: productionCostTypeRepo,
		WorkerRepository:             workerRepo,
		SeasonRepository:             seasonRepo,
	}
}

func (c *MasterDataUseCase) SearchHarvestTypes(ctx context.Context) ([]model.HarvestTypeResponse, error) {
	tx := c.DB.WithContext(ctx)
	var entities []entity.HarvestType
	if err := c.HarvestTypeRepository.FindAll(tx, &entities); err != nil {
		c.Log.WithError(err).Error("error searching harvest types")
		return nil, fiber.ErrInternalServerError
	}
	responses := make([]model.HarvestTypeResponse, len(entities))
	for i, e := range entities {
		responses[i] = *converter.HarvestTypeToResponse(&e)
	}
	return responses, nil
}

func (c *MasterDataUseCase) SearchProductionCostTypes(ctx context.Context) ([]model.ProductionCostTypeResponse, error) {
	tx := c.DB.WithContext(ctx)
	var entities []entity.ProductionCostType
	if err := c.ProductionCostTypeRepository.FindAll(tx, &entities); err != nil {
		c.Log.WithError(err).Error("error searching production cost types")
		return nil, fiber.ErrInternalServerError
	}
	responses := make([]model.ProductionCostTypeResponse, len(entities))
	for i, e := range entities {
		responses[i] = *converter.ProductionCostTypeToResponse(&e)
	}
	return responses, nil
}

func (c *MasterDataUseCase) SearchWorkers(ctx context.Context) ([]model.WorkerResponse, error) {
	tx := c.DB.WithContext(ctx)
	var entities []entity.Worker
	if err := c.WorkerRepository.FindAll(tx, &entities); err != nil {
		c.Log.WithError(err).Error("error searching workers")
		return nil, fiber.ErrInternalServerError
	}
	responses := make([]model.WorkerResponse, len(entities))
	for i, e := range entities {
		responses[i] = *converter.WorkerToResponse(&e)
	}
	return responses, nil
}

func (c *MasterDataUseCase) SearchSeasons(ctx context.Context) ([]model.SeasonResponse, error) {
	tx := c.DB.WithContext(ctx)
	var entities []entity.Season
	if err := c.SeasonRepository.FindAll(tx, &entities); err != nil {
		c.Log.WithError(err).Error("error searching seasons")
		return nil, fiber.ErrInternalServerError
	}
	responses := make([]model.SeasonResponse, len(entities))
	for i, e := range entities {
		responses[i] = *converter.SeasonToResponse(&e)
	}
	return responses, nil
}

func (c *MasterDataUseCase) EndCurrentSeason(ctx context.Context) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	// 1. Find active season (end_date is NULL)
	var activeSeason entity.Season
	if err := tx.Where("end_date IS NULL").First(&activeSeason).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			c.Log.WithError(err).Error("error finding active season")
			return fiber.ErrInternalServerError
		}
		// If no active season found, we might just want to start a new one? 
		// Or it's an error? Assuming we proceed to create one if none exists is safer 
		// but let's stick to the requirement: "populate active season end date".
	}

	now := time.Now()

	// 2. Update active season end date
	if activeSeason.ID != 0 {
		activeSeason.EndDate = &now
		if err := tx.Save(&activeSeason).Error; err != nil {
			c.Log.WithError(err).Error("error updating active season")
			return fiber.ErrInternalServerError
		}
	}

	// 3. Create new season
	newSeason := entity.Season{
		StartDate: now,
	}
	if err := tx.Create(&newSeason).Error; err != nil {
		c.Log.WithError(err).Error("error creating new season")
		return fiber.ErrInternalServerError
	}

	return tx.Commit().Error
}
