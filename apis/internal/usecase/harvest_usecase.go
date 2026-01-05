package usecase

import (
	"context"
	"time"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/model/converter"
	"github.com/erwinarif31/catchery-api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type HarvestUseCase struct {
	DB                *gorm.DB
	Log               *logrus.Logger
	HarvestRepository *repository.HarvestRepository
	SeasonRepository  *repository.SeasonRepository
}

func NewHarvestUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	harvestRepository *repository.HarvestRepository,
	seasonRepository *repository.SeasonRepository,
) *HarvestUseCase {
	return &HarvestUseCase{
		DB:                db,
		Log:               log,
		HarvestRepository: harvestRepository,
		SeasonRepository:  seasonRepository,
	}
}

func (c *HarvestUseCase) Create(ctx context.Context, request *model.CreateHarvestRequest) (*model.HarvestResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	// Find active season
	var activeSeason entity.Season
	if err := tx.Where("end_date IS NULL").First(&activeSeason).Error; err != nil {
		c.Log.WithError(err).Error("error finding active season")
		return nil, fiber.NewError(fiber.StatusBadRequest, "No active season found")
	}

	harvestDate, err := time.Parse("2006-01-02", request.HarvestDate)
	if err != nil {
		c.Log.WithError(err).Error("error parsing harvest date")
		return nil, fiber.ErrBadRequest
	}

	entity := &entity.Harvest{
		ID:             uuid.New().String(),
		HarvestDate:    harvestDate,
		Weight:         request.Weight,
		Price:          request.Price,
		BagangID:       request.BagangID,
		HarvestType:    request.HarvestType,
		HarvestsSeason: activeSeason.ID,
		Description:    request.Description,
	}

	if err := c.HarvestRepository.Create(tx, entity); err != nil {
		c.Log.WithError(err).Error("error creating harvest")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing harvest")
		return nil, fiber.ErrInternalServerError
	}

	return converter.HarvestToResponse(entity), nil
}

func (c *HarvestUseCase) Update(ctx context.Context, id string, request *model.UpdateHarvestRequest) (*model.HarvestResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	entity := new(entity.Harvest)
	if err := c.HarvestRepository.FindById(tx, entity, id); err != nil {
		return nil, fiber.ErrNotFound
	}

	if request.HarvestDate != "" {
		harvestDate, err := time.Parse("2006-01-02", request.HarvestDate)
		if err != nil {
			c.Log.WithError(err).Error("error parsing harvest date")
			return nil, fiber.ErrBadRequest
		}
		entity.HarvestDate = harvestDate
	}
	entity.Weight = request.Weight
	entity.Price = request.Price
	if request.HarvestType != "" {
		entity.HarvestType = request.HarvestType
	}
	entity.Description = request.Description

	if err := c.HarvestRepository.Update(tx, entity); err != nil {
		c.Log.WithError(err).Error("error updating harvest")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing update harvest")
		return nil, fiber.ErrInternalServerError
	}

	return converter.HarvestToResponse(entity), nil
}

func (c *HarvestUseCase) Delete(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	entity := &entity.Harvest{ID: id}
	if err := c.HarvestRepository.Delete(tx, entity); err != nil {
		c.Log.WithError(err).Error("error deleting harvest")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing delete harvest")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *HarvestUseCase) SearchByBagangId(ctx context.Context, bagangId string) ([]model.HarvestResponse, error) {
	tx := c.DB.WithContext(ctx)
	harvests, err := c.HarvestRepository.FindByBagangId(tx, bagangId)
	if err != nil {
		c.Log.WithError(err).Error("error searching harvests")
		return nil, fiber.ErrInternalServerError
	}

	responses := make([]model.HarvestResponse, len(harvests))
	for i, harvest := range harvests {
		responses[i] = *converter.HarvestToResponse(&harvest)
	}
	return responses, nil
}
