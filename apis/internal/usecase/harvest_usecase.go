package usecase

import (
	"context"
	"time"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/model/converter"
	"github.com/erwinarif31/catchery-api/internal/repository"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type HarvestUseCase struct {
	DB                *gorm.DB
	Log               *logrus.Logger
	Validate          *validator.Validate
	HarvestRepository *repository.HarvestRepository
	SeasonRepository  *repository.SeasonRepository
	BagangRepository  *repository.BagangRepository
}

func NewHarvestUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	harvestRepository *repository.HarvestRepository,
	seasonRepository *repository.SeasonRepository,
	bagangRepository *repository.BagangRepository,
) *HarvestUseCase {
	return &HarvestUseCase{
		DB:                db,
		Log:               log,
		Validate:          validate,
		HarvestRepository: harvestRepository,
		SeasonRepository:  seasonRepository,
		BagangRepository:  bagangRepository,
	}
}

func (c *HarvestUseCase) Create(ctx context.Context, auth *model.Auth, request *model.CreateHarvestRequest) (*model.HarvestResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

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

	bagang := new(entity.Bagang)
	if err := c.BagangRepository.FindById(tx.Preload("Worker").Preload("Owner"), bagang, request.BagangID); err != nil {
		c.Log.WithError(err).Error("error finding bagang")
		return nil, fiber.ErrNotFound
	}
	if !bagangInScope(auth, bagang) {
		return nil, fiber.ErrForbidden
	}
	if err := lockBagangRow(tx, request.BagangID); err != nil {
		c.Log.WithError(err).Error("error locking bagang for harvest creation")
		return nil, fiber.ErrNotFound
	}

	createdBy, createdByName, err := c.resolveHarvestCreator(auth, bagang, request.CreatedBy)
	if err != nil {
		return nil, err
	}

	harvest := &entity.Harvest{
		ID:             uuid.New().String(),
		HarvestDate:    harvestDate,
		Weight:         request.Weight,
		Price:          request.Price,
		BagangID:       request.BagangID,
		HarvestType:    request.HarvestType,
		CreatedBy:      createdBy,
		CreatedByName:  createdByName,
		HarvestsSeason: activeSeason.ID,
		Description:    request.Description,
	}

	if err := c.HarvestRepository.Create(tx, harvest); err != nil {
		c.Log.WithError(err).Error("error creating harvest")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing harvest")
		return nil, fiber.ErrInternalServerError
	}

	return converter.HarvestToResponse(harvest), nil
}

func (c *HarvestUseCase) Update(ctx context.Context, auth *model.Auth, id string, request *model.UpdateHarvestRequest) (*model.HarvestResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	harvest := new(entity.Harvest)
	if err := c.HarvestRepository.FindById(tx, harvest, id); err != nil {
		return nil, fiber.ErrNotFound
	}
	bagang := new(entity.Bagang)
	if err := c.BagangRepository.FindById(tx.Preload("Worker").Preload("Owner"), bagang, harvest.BagangID); err != nil {
		c.Log.WithError(err).Error("error finding bagang")
		return nil, fiber.ErrNotFound
	}
	if !bagangInScope(auth, bagang) {
		return nil, fiber.ErrForbidden
	}
	if err := lockBagangRow(tx, harvest.BagangID); err != nil {
		c.Log.WithError(err).Error("error locking bagang for harvest update")
		return nil, fiber.ErrNotFound
	}

	if request.HarvestDate != "" {
		harvestDate, err := time.Parse("2006-01-02", request.HarvestDate)
		if err != nil {
			c.Log.WithError(err).Error("error parsing harvest date")
			return nil, fiber.ErrBadRequest
		}
		harvest.HarvestDate = harvestDate
	}
	if request.Weight != nil {
		harvest.Weight = *request.Weight
	}
	if request.Price != nil {
		harvest.Price = *request.Price
	}
	if request.HarvestType != "" {
		harvest.HarvestType = request.HarvestType
	}
	if request.Description != nil {
		harvest.Description = *request.Description
	}

	if err := c.HarvestRepository.Update(tx, harvest); err != nil {
		c.Log.WithError(err).Error("error updating harvest")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing update harvest")
		return nil, fiber.ErrInternalServerError
	}

	return converter.HarvestToResponse(harvest), nil
}

func (c *HarvestUseCase) Delete(ctx context.Context, auth *model.Auth, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	harvest := new(entity.Harvest)
	if err := c.HarvestRepository.FindById(tx, harvest, id); err != nil {
		return fiber.ErrNotFound
	}
	bagang := new(entity.Bagang)
	if err := c.BagangRepository.FindById(tx.Preload("Worker").Preload("Owner"), bagang, harvest.BagangID); err != nil {
		c.Log.WithError(err).Error("error finding bagang")
		return fiber.ErrNotFound
	}
	if !bagangInScope(auth, bagang) {
		return fiber.ErrForbidden
	}
	if err := lockBagangRow(tx, harvest.BagangID); err != nil {
		return fiber.ErrNotFound
	}

	if err := c.HarvestRepository.Delete(tx, harvest); err != nil {
		c.Log.WithError(err).Error("error deleting harvest")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing delete harvest")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *HarvestUseCase) SearchByBagangId(ctx context.Context, auth *model.Auth, bagangId string) ([]model.HarvestResponse, error) {
	tx := c.DB.WithContext(ctx)
	bagang := new(entity.Bagang)
	if err := c.BagangRepository.FindById(tx.Preload("Worker").Preload("Owner"), bagang, bagangId); err != nil {
		c.Log.WithError(err).Error("error finding bagang")
		return nil, fiber.ErrNotFound
	}
	if !bagangInScope(auth, bagang) {
		return nil, fiber.ErrForbidden
	}
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

func (c *HarvestUseCase) resolveHarvestCreator(auth *model.Auth, bagang *entity.Bagang, createdBy string) (*string, *string, error) {
	if auth == nil {
		return nil, nil, fiber.ErrUnauthorized
	}

	resolved := createdBy
	switch auth.Role {
	case "ADMIN":
		if resolved == "" {
			resolved = bagang.WorkerID
		}
	case "OWNER":
		if auth.WorkerID == nil || bagang.OwnerID != *auth.WorkerID {
			return nil, nil, fiber.ErrForbidden
		}
		resolved = bagang.OwnerID
	case "WORKER":
		if auth.WorkerID == nil || bagang.WorkerID != *auth.WorkerID {
			return nil, nil, fiber.ErrForbidden
		}
		resolved = bagang.WorkerID
	default:
		return nil, nil, fiber.ErrUnauthorized
	}

	if resolved != bagang.WorkerID && resolved != bagang.OwnerID {
		return nil, nil, fiber.NewError(fiber.StatusBadRequest, "created_by must be bagang worker or owner")
	}

	var name string
	switch resolved {
	case bagang.WorkerID:
		if bagang.Worker != nil {
			name = bagang.Worker.Name
		}
	case bagang.OwnerID:
		if bagang.Owner != nil {
			name = bagang.Owner.Name
		} else if bagang.Worker != nil && bagang.WorkerID == bagang.OwnerID {
			name = bagang.Worker.Name
		}
	}

	if name == "" {
		return &resolved, nil, nil
	}
	return &resolved, &name, nil
}
