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

type CustomerUseCase struct {
	DB                 *gorm.DB
	Log                *logrus.Logger
	Validate           *validator.Validate
	CustomerRepository *repository.CustomerRepository
}

func NewCustomerUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	customerRepository *repository.CustomerRepository,
) *CustomerUseCase {
	return &CustomerUseCase{
		DB:                 db,
		Log:                log,
		Validate:           validate,
		CustomerRepository: customerRepository,
	}
}

func (c *CustomerUseCase) Create(ctx context.Context, request *model.CreateCustomerRequest) (*model.CustomerResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	customer := &entity.Customer{
		ID:      uuid.New().String(),
		Name:    request.Name,
		Contact: request.Contact,
		Address: request.Address,
	}

	if err := c.CustomerRepository.Create(tx, customer); err != nil {
		c.Log.WithError(err).Error("error creating customer")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing transaction")
		return nil, fiber.ErrInternalServerError
	}

	return converter.CustomerToResponse(customer), nil
}

func (c *CustomerUseCase) Update(ctx context.Context, id string, request *model.UpdateCustomerRequest) (*model.CustomerResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	customer := new(entity.Customer)
	if err := c.CustomerRepository.FindById(tx, customer, id); err != nil {
		return nil, fiber.ErrNotFound
	}

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	customer.Name = request.Name
	customer.Contact = request.Contact
	customer.Address = request.Address

	if err := c.CustomerRepository.Update(tx, customer); err != nil {
		c.Log.WithError(err).Error("error updating customer")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing transaction")
		return nil, fiber.ErrInternalServerError
	}

	return converter.CustomerToResponse(customer), nil
}

func (c *CustomerUseCase) Delete(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	customer := new(entity.Customer)
	if err := c.CustomerRepository.FindById(tx, customer, id); err != nil {
		return fiber.ErrNotFound
	}

	if err := c.CustomerRepository.Delete(tx, customer); err != nil {
		c.Log.WithError(err).Error("error deleting customer")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *CustomerUseCase) FindById(ctx context.Context, id string) (*model.CustomerResponse, error) {
	tx := c.DB.WithContext(ctx)
	customer := new(entity.Customer)
	if err := c.CustomerRepository.FindById(tx, customer, id); err != nil {
		return nil, fiber.ErrNotFound
	}
	return converter.CustomerToResponse(customer), nil
}

func (c *CustomerUseCase) Search(ctx context.Context, request *model.SearchCustomerRequest) ([]model.CustomerResponse, error) {
	tx := c.DB.WithContext(ctx)
	customers, err := c.CustomerRepository.Search(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("error searching customers")
		return nil, fiber.ErrInternalServerError
	}

	responses := make([]model.CustomerResponse, len(customers))
	for i, customer := range customers {
		responses[i] = *converter.CustomerToResponse(&customer)
	}

	return responses, nil
}
