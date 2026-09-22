package usecase

import (
	"context"

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

type ProductionCostUseCase struct {
	DB                       *gorm.DB
	Log                      *logrus.Logger
	Validate                 *validator.Validate
	ProductionCostRepository *repository.ProductionCostRepository
	SeasonRepository         *repository.SeasonRepository
	BagangRepository         *repository.BagangRepository
}

func NewProductionCostUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	productionCostRepository *repository.ProductionCostRepository,
	seasonRepository *repository.SeasonRepository,
	bagangRepository *repository.BagangRepository,
) *ProductionCostUseCase {
	return &ProductionCostUseCase{
		DB:                       db,
		Log:                      log,
		Validate:                 validate,
		ProductionCostRepository: productionCostRepository,
		SeasonRepository:         seasonRepository,
		BagangRepository:         bagangRepository,
	}
}

func (c *ProductionCostUseCase) Create(ctx context.Context, auth *model.Auth, request *model.CreateProductionCostRequest) (*model.ProductionCostResponse, error) {
	if auth == nil {
		return nil, fiber.ErrUnauthorized
	}
	if auth.Role == "WORKER" {
		return nil, fiber.ErrForbidden
	}

	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	var activeSeason entity.Season
	if err := tx.Where("end_date IS NULL").First(&activeSeason).Error; err != nil {
		c.Log.WithError(err).Error("error finding active season")
		return nil, fiber.NewError(fiber.StatusBadRequest, "No active season found")
	}

	bagang, err := c.findBagangWithPeople(tx, request.BagangID)
	if err != nil {
		return nil, err
	}
	if !bagangInScope(auth, bagang) {
		return nil, fiber.ErrForbidden
	}

	creatorRole := request.CreatorRole
	if auth != nil {
		switch auth.Role {
		case "WORKER":
			creatorRole = "worker"
		case "OWNER":
			creatorRole = "owner"
		case "ADMIN":
			if creatorRole == "" {
				creatorRole = "both"
			}
		default:
			return nil, fiber.ErrUnauthorized
		}
	}

	createdBy, createdByName, err := resolveProductionCostCreator(bagang, creatorRole)
	if err != nil {
		return nil, err
	}

	entity := &entity.ProductionCost{
		ID:                    uuid.New().String(),
		BagangID:              request.BagangID,
		ProductionCostType:    request.ProductionCostType,
		Price:                 request.Price,
		ProductionCostsSeason: activeSeason.ID,
		CreatorRole:           creatorRole,
		CreatedBy:             createdBy,
		CreatedByName:         createdByName,
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

func (c *ProductionCostUseCase) Update(ctx context.Context, auth *model.Auth, id string, request *model.UpdateProductionCostRequest) (*model.ProductionCostResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	entity := new(entity.ProductionCost)
	if err := c.ProductionCostRepository.FindById(tx, entity, id); err != nil {
		return nil, fiber.ErrNotFound
	}
	bagang, err := c.findBagangWithPeople(tx, entity.BagangID)
	if err != nil {
		return nil, err
	}
	if !bagangInScope(auth, bagang) {
		return nil, fiber.ErrForbidden
	}
	if err := authorizeProductionCostMutation(auth, entity); err != nil {
		return nil, err
	}

	if request.ProductionCostType != "" {
		entity.ProductionCostType = request.ProductionCostType
	}
	if request.Price != nil {
		entity.Price = *request.Price
	}

	role := entity.CreatorRole
	if auth != nil && auth.Role == "ADMIN" && request.CreatorRole != "" {
		role = request.CreatorRole
	}
	createdBy, createdByName, err := resolveProductionCostCreator(bagang, role)
	if err != nil {
		return nil, err
	}
	entity.CreatorRole = role
	entity.CreatedBy = createdBy
	entity.CreatedByName = createdByName

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

func (c *ProductionCostUseCase) Delete(ctx context.Context, auth *model.Auth, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	entity := new(entity.ProductionCost)
	if err := c.ProductionCostRepository.FindById(tx, entity, id); err != nil {
		return fiber.ErrNotFound
	}
	bagang, err := c.findBagangWithPeople(tx, entity.BagangID)
	if err != nil {
		return err
	}
	if !bagangInScope(auth, bagang) {
		return fiber.ErrForbidden
	}
	if err := authorizeProductionCostMutation(auth, entity); err != nil {
		return err
	}

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

func (c *ProductionCostUseCase) SearchByBagangId(ctx context.Context, auth *model.Auth, bagangId string) ([]model.ProductionCostResponse, error) {
	tx := c.DB.WithContext(ctx)
	bagang, err := c.findBagangWithPeople(tx, bagangId)
	if err != nil {
		return nil, err
	}
	if !bagangInScope(auth, bagang) {
		return nil, fiber.ErrForbidden
	}
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

func (c *ProductionCostUseCase) findBagangWithPeople(db *gorm.DB, bagangID string) (*entity.Bagang, error) {
	bagang := new(entity.Bagang)
	if err := c.BagangRepository.FindById(db.Preload("Worker").Preload("Owner"), bagang, bagangID); err != nil {
		c.Log.WithError(err).Error("error finding bagang")
		return nil, fiber.ErrNotFound
	}
	return bagang, nil
}

func authorizeProductionCostMutation(auth *model.Auth, cost *entity.ProductionCost) error {
	if auth == nil {
		return fiber.ErrUnauthorized
	}
	if auth.Role == "ADMIN" {
		return nil
	}
	if auth.Role == "WORKER" {
		return fiber.ErrForbidden
	}
	if auth.WorkerID == nil || cost.CreatedBy == nil || *auth.WorkerID != *cost.CreatedBy {
		return fiber.ErrForbidden
	}
	if auth.Role == "OWNER" && (cost.CreatorRole == "owner" || cost.CreatorRole == "both") {
		return nil
	}
	return fiber.ErrForbidden
}

func resolveProductionCostCreator(bagang *entity.Bagang, role string) (*string, *string, error) {
	var createdBy string
	var name string

	switch role {
	case "worker":
		createdBy = bagang.WorkerID
		if bagang.Worker != nil {
			name = bagang.Worker.Name
		}
	case "owner":
		createdBy = bagang.OwnerID
		if bagang.Owner != nil {
			name = bagang.Owner.Name
		} else if bagang.Worker != nil && bagang.WorkerID == bagang.OwnerID {
			name = bagang.Worker.Name
		}
	case "both":
		createdBy = bagang.OwnerID
		if bagang.Worker != nil {
			name = bagang.Worker.Name
		}
		if bagang.Owner != nil && bagang.OwnerID != bagang.WorkerID {
			if name != "" {
				name += " & "
			}
			name += bagang.Owner.Name
		}
	default:
		return nil, nil, fiber.ErrBadRequest
	}

	if name == "" {
		return &createdBy, nil, nil
	}
	return &createdBy, &name, nil
}
