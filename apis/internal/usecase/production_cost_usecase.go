package usecase

import (
	"context"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/model/converter"
	"github.com/erwinarif31/catchery-api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ProductionCostUseCase struct {
	DB                       *gorm.DB
	Log                      *logrus.Logger
	ProductionCostRepository *repository.ProductionCostRepository
	SeasonRepository         *repository.SeasonRepository
}

func NewProductionCostUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	productionCostRepository *repository.ProductionCostRepository,
	seasonRepository *repository.SeasonRepository,
) *ProductionCostUseCase {
	return &ProductionCostUseCase{
		DB:                       db,
		Log:                      log,
		ProductionCostRepository: productionCostRepository,
		SeasonRepository:         seasonRepository,
	}
}

func (c *ProductionCostUseCase) Create(ctx context.Context, request *model.CreateProductionCostRequest) (*model.ProductionCostResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	var activeSeason entity.Season
	if err := tx.Where("end_date IS NULL").First(&activeSeason).Error; err != nil {
		c.Log.WithError(err).Error("error finding active season")
		return nil, fiber.NewError(fiber.StatusBadRequest, "No active season found")
	}

	entity := &entity.ProductionCost{
		ID:                    uuid.New().String(),
		BagangID:              request.BagangID,
		ProductionCostType:    request.ProductionCostType,
		Price:                 request.Price,
		ProductionCostsSeason: activeSeason.ID,
		CreatorRole:           request.CreatorRole,
	}

	if err := c.ProductionCostRepository.Create(tx, entity); err != nil {
		c.Log.WithError(err).Error("error creating production cost")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing production cost")
		return nil, fiber.ErrInternalServerError
	}

	return converter.ProductionCostToResponse(entity), nil
}

func (c *ProductionCostUseCase) Update(ctx context.Context, id string, request *model.UpdateProductionCostRequest) (*model.ProductionCostResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	entity := new(entity.ProductionCost)
	if err := c.ProductionCostRepository.FindById(tx, entity, id); err != nil {
		return nil, fiber.ErrNotFound
	}

	if request.ProductionCostType != "" {
		entity.ProductionCostType = request.ProductionCostType
	}
	entity.Price = request.Price
	if request.CreatorRole != "" {
		entity.CreatorRole = request.CreatorRole
	}

	if err := c.ProductionCostRepository.Update(tx, entity); err != nil {
		c.Log.WithError(err).Error("error updating production cost")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing update production cost")
		return nil, fiber.ErrInternalServerError
	}

	return converter.ProductionCostToResponse(entity), nil
}

func (c *ProductionCostUseCase) Delete(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	entity := &entity.ProductionCost{ID: id}
	if err := c.ProductionCostRepository.Delete(tx, entity); err != nil {
		c.Log.WithError(err).Error("error deleting production cost")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing delete production cost")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *ProductionCostUseCase) SearchByBagangId(ctx context.Context, bagangId string) ([]model.ProductionCostResponse, error) {
	tx := c.DB.WithContext(ctx)
	costs, err := c.ProductionCostRepository.FindByBagangId(tx, bagangId)
	if err != nil {
		c.Log.WithError(err).Error("error searching production costs")
		return nil, fiber.ErrInternalServerError
	}

	responses := make([]model.ProductionCostResponse, len(costs))
	for i, cost := range costs {
		responses[i] = *converter.ProductionCostToResponse(&cost)
	}
	return responses, nil
}
