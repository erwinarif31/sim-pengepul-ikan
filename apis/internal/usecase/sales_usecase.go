package usecase

import (
	"context"

	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/model/converter"
	"github.com/erwinarif31/catchery-api/internal/repository"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type SalesUseCase struct {
	DB              *gorm.DB
	Log             *logrus.Logger
	Validate        *validator.Validate
	SalesRepository *repository.SalesRepository
}

func NewSalesUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	salesRepository *repository.SalesRepository,
) *SalesUseCase {
	return &SalesUseCase{
		DB:              db,
		Log:             log,
		Validate:        validate,
		SalesRepository: salesRepository,
	}
}

func (c *SalesUseCase) Search(ctx context.Context) ([]model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx)

	sales, err := c.SalesRepository.Search(tx)
	if err != nil {
		c.Log.WithError(err).Error("error searching sales")
		return nil, fiber.ErrInternalServerError
	}

	responses := make([]model.SalesResponse, len(sales))
	for i, sale := range sales {
		responses[i] = *converter.SalesToResponse(&sale)
	}

	return responses, nil
}
