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
	auth *model.Auth,
	request *model.BagangCreateRequest,
) (*model.BagangResponse, error) {
	if err := authorizeBagangMutation(auth, nil); err != nil {
		return nil, err
	}
	if auth.Role == "OWNER" {
		if auth.WorkerID == nil {
			return nil, fiber.ErrForbidden
		}
		if request.OwnerID != "" && request.OwnerID != *auth.WorkerID {
			return nil, fiber.ErrForbidden
		}
		request.OwnerID = *auth.WorkerID
	}

	tx := b.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := b.Validate.Struct(request); err != nil {
		b.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	bagang := &entity.Bagang{
		ID:       uuid.New().String(),
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
	return converter.BagangToResponse(bagang), nil
}

func (b *BagangUseCase) Update(
	ctx context.Context,
	auth *model.Auth,
	id string,
	request *model.BagangCreateRequest,
) (*model.BagangResponse, error) {
	tx := b.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	bagang := new(entity.Bagang)
	if err := b.BagangRepository.FindById(tx, bagang, id); err != nil {
		b.Log.WithError(err).Error("error finding bagang")
		return nil, fiber.ErrNotFound
	}
	if err := authorizeBagangMutation(auth, bagang); err != nil {
		return nil, err
	}
	if auth.Role == "OWNER" {
		if request.OwnerID != "" && request.OwnerID != *auth.WorkerID {
			return nil, fiber.ErrForbidden
		}
		request.OwnerID = *auth.WorkerID
	}

	if err := b.Validate.Struct(request); err != nil {
		b.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	bagang.Name = request.Name
	bagang.Isactive = request.IsActive
	bagang.WorkerID = request.WorkerID
	bagang.OwnerID = request.OwnerID

	if err := b.BagangRepository.Update(tx, bagang); err != nil {
		b.Log.WithError(err).Error("error updating bagang")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		b.Log.WithError(err).Error("error committing update bagang")
		return nil, fiber.ErrInternalServerError
	}

	return converter.BagangToResponse(bagang), nil
}

func (b *BagangUseCase) Delete(ctx context.Context, auth *model.Auth, id string) error {
	tx := b.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	bagang := new(entity.Bagang)
	if err := b.BagangRepository.FindById(tx, bagang, id); err != nil {
		b.Log.WithError(err).Error("error finding bagang")
		return fiber.ErrNotFound
	}
	if err := authorizeBagangMutation(auth, bagang); err != nil {
		return err
	}

	if err := b.BagangRepository.Delete(tx, bagang); err != nil {
		b.Log.WithError(err).Error("error deleting bagang")
		return fiber.ErrInternalServerError
	}

	return tx.Commit().Error
}

func (b *BagangUseCase) FindById(ctx context.Context, auth *model.Auth, id string) (*model.BagangResponse, error) {
	tx := b.DB.WithContext(ctx).Preload("Worker").Preload("Owner")
	bagang := new(entity.Bagang)
	if err := b.BagangRepository.FindById(tx, bagang, id); err != nil {
		b.Log.WithError(err).Error("error finding bagang")
		return nil, fiber.ErrNotFound
	}
	if !bagangInScope(auth, bagang) {
		return nil, fiber.ErrForbidden
	}
	return converter.BagangToResponse(bagang), nil
}

func (b *BagangUseCase) Search(ctx context.Context, auth *model.Auth, request *model.SearchBagangRequest) ([]model.BagangResponse, error) {
	if !bagangRoleIsValid(auth) {
		return nil, fiber.ErrForbidden
	}
	if auth.Role == "OWNER" {
		if auth.WorkerID == nil {
			return nil, fiber.ErrForbidden
		}
		request.OwnerID = *auth.WorkerID
	}
	if auth.Role == "WORKER" {
		if auth.WorkerID == nil {
			return nil, fiber.ErrForbidden
		}
		request.WorkerID = *auth.WorkerID
	}

	tx := b.DB.WithContext(ctx).Preload("Worker").Preload("Owner")

	bagangs, err := b.BagangRepository.Search(tx, request)
	if err != nil {
		b.Log.WithError(err).Error("error finding bagangs")
		return nil, fiber.ErrInternalServerError
	}

	responses := make([]model.BagangResponse, len(bagangs))
	for i, bagang := range bagangs {
		responses[i] = *converter.BagangToResponse(&bagang)
	}

	return responses, nil
}

func bagangRoleIsValid(auth *model.Auth) bool {
	return auth != nil && (auth.Role == "ADMIN" || auth.Role == "OWNER" || auth.Role == "WORKER")
}

func bagangInScope(auth *model.Auth, bagang *entity.Bagang) bool {
	if !bagangRoleIsValid(auth) {
		return false
	}
	if auth.Role == "ADMIN" {
		return true
	}
	if auth.WorkerID == nil {
		return false
	}
	if auth.Role == "OWNER" {
		return bagang.OwnerID == *auth.WorkerID
	}
	return bagang.WorkerID == *auth.WorkerID
}

func authorizeBagangMutation(auth *model.Auth, bagang *entity.Bagang) error {
	if !bagangRoleIsValid(auth) {
		return fiber.ErrUnauthorized
	}
	if auth.Role == "WORKER" {
		return fiber.ErrForbidden
	}
	if bagang != nil && !bagangInScope(auth, bagang) {
		return fiber.ErrForbidden
	}
	return nil
}
