package usecase

import (
	"context"
	"log"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/model/converter"
	"github.com/erwinarif31/catchery-api/internal/repository"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type BagangUseCase struct {
	DB               *gorm.DB
	Log              *logrus.Logger
	Validate         *validator.Validate
	BagangRepository *repository.BagangRepository
}

func NewBagangUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	bagangRepository *repository.BagangRepository,
) *BagangUseCase {
	return &BagangUseCase{
		DB:               db,
		Log:              log,
		Validate:         validate,
		BagangRepository: bagangRepository,
	}
}

func (b *BagangUseCase) Create(
	ctx context.Context,
	request *model.BagangCreateRequest,
) (*model.BagangResponse, error) {
	tx := b.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := b.Validate.Struct(request); err != nil {
		b.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	bagang := &entity.Bagang{
		Name:     request.Name,
		Isactive: request.IsActive,
		WorkerID: request.WorkerID,
		OwnerID:  request.OwnerID,
	}

	if err := b.BagangRepository.Create(tx, bagang); err != nil {
		b.Log.WithError(err).Error("error creating bagang")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		b.Log.WithError(err).Error("error creating bagang")
		return nil, fiber.ErrInternalServerError
	}
	log.Println("test")
	return converter.BagangToResponse(bagang), nil
}

func (b *BagangUseCase) Search(ctx context.Context) ([]model.BagangResponse, error) {
	tx := b.DB.WithContext(ctx)

	var bagangs []entity.Bagang
	if err := b.BagangRepository.FindAll(tx, &bagangs); err != nil {
		b.Log.WithError(err).Error("error finding bagangs")
		return nil, fiber.ErrInternalServerError
	}

	responses := make([]model.BagangResponse, len(bagangs))
	for i, bagang := range bagangs {
		responses[i] = *converter.BagangToResponse(&bagang)
	}

	return responses, nil
}
