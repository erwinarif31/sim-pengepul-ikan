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

func (c *MasterDataUseCase) CreateHarvestType(ctx context.Context, request *model.CreateMasterDataRequest) (*model.HarvestTypeResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.DB.WithContext(ctx).Where("name = ?", request.Name).First(&entity.HarvestType{}).Error; err == nil {
		return nil, fiber.NewError(fiber.StatusConflict, "Harvest Type already exists")
	}

	entity := &entity.HarvestType{
		Name: request.Name,
	}

	if err := c.HarvestTypeRepository.Create(tx, entity); err != nil {
		c.Log.WithError(err).Error("error creating harvest type")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing harvest type")
		return nil, fiber.ErrInternalServerError
	}

	return converter.HarvestTypeToResponse(entity), nil
}

func (c *MasterDataUseCase) DeleteHarvestType(ctx context.Context, name string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	entity := &entity.HarvestType{Name: name}
	if err := c.HarvestTypeRepository.Delete(tx, entity); err != nil {
		c.Log.WithError(err).Error("error deleting harvest type")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing delete harvest type")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *MasterDataUseCase) CreateProductionCostType(ctx context.Context, request *model.CreateMasterDataRequest) (*model.ProductionCostTypeResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.DB.WithContext(ctx).Where("name = ?", request.Name).First(&entity.ProductionCostType{}).Error; err == nil {
		return nil, fiber.NewError(fiber.StatusConflict, "Production Cost Type already exists")
	}

	entity := &entity.ProductionCostType{
		Name: request.Name,
	}

	if err := c.ProductionCostTypeRepository.Create(tx, entity); err != nil {
		c.Log.WithError(err).Error("error creating production cost type")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing production cost type")
		return nil, fiber.ErrInternalServerError
	}

	return converter.ProductionCostTypeToResponse(entity), nil
}

func (c *MasterDataUseCase) DeleteProductionCostType(ctx context.Context, name string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	entity := &entity.ProductionCostType{Name: name}
	if err := c.ProductionCostTypeRepository.Delete(tx, entity); err != nil {
		c.Log.WithError(err).Error("error deleting production cost type")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing delete production cost type")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *MasterDataUseCase) CreateWorker(ctx context.Context, request *model.CreateMasterDataRequest) (*model.WorkerResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	entity := &entity.Worker{
		Name: request.Name,
	}

	// ID is auto-generated by DB (gen_random_uuid()) or by GORM hooks if configured.
	// Entity definition says: ID string `gorm:"column:id;primaryKey;type:uuid"`.
	// Postgres will likely generate it if we omit it, IF default is set in DB.
	// SQL Dump: id uuid NOT NULL (no default gen_random_uuid()).
	// Wait, Bagang had default gen_random_uuid(). Workers does NOT in the dump provided in Turn 17.
	// "CREATE TABLE public.workers (id uuid NOT NULL, name character varying(255) NOT NULL);"
	// This means we MUST generate UUID in code.

	entity.ID = uuid.New().String()

	if err := c.WorkerRepository.Create(tx, entity); err != nil {
		c.Log.WithError(err).Error("error creating worker")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing worker")
		return nil, fiber.ErrInternalServerError
	}

	return converter.WorkerToResponse(entity), nil
}

func (c *MasterDataUseCase) UpdateWorker(ctx context.Context, id string, request *model.CreateMasterDataRequest) (*model.WorkerResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	entity := new(entity.Worker)
	if err := c.WorkerRepository.FindById(tx, entity, id); err != nil {
		c.Log.WithError(err).Error("error finding worker")
		return nil, fiber.ErrNotFound
	}

	entity.Name = request.Name

	if err := c.WorkerRepository.Update(tx, entity); err != nil {
		c.Log.WithError(err).Error("error updating worker")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing update worker")
		return nil, fiber.ErrInternalServerError
	}

	return converter.WorkerToResponse(entity), nil
}

func (c *MasterDataUseCase) DeleteWorker(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	entity := &entity.Worker{ID: id}
	if err := c.WorkerRepository.Delete(tx, entity); err != nil {
		c.Log.WithError(err).Error("error deleting worker")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing delete worker")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *MasterDataUseCase) FindWorkerById(ctx context.Context, id string) (*model.WorkerResponse, error) {
	tx := c.DB.WithContext(ctx)
	entity := new(entity.Worker)
	if err := c.WorkerRepository.FindById(tx, entity, id); err != nil {
		c.Log.WithError(err).Error("error finding worker")
		return nil, fiber.ErrNotFound
	}
	return converter.WorkerToResponse(entity), nil
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
