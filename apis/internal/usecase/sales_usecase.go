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
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type SalesUseCase struct {
	DB                          *gorm.DB
	Log                         *logrus.Logger
	Validate                    *validator.Validate
	SalesRepository             *repository.SalesRepository
	SalesDetailRepository       *repository.SalesDetailRepository
	TransactionDetailRepository *repository.TransactionDetailRepository
}

func NewSalesUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	salesRepository *repository.SalesRepository,
	salesDetailRepository *repository.SalesDetailRepository,
	transactionDetailRepository *repository.TransactionDetailRepository,
) *SalesUseCase {
	return &SalesUseCase{
		DB:                          db,
		Log:                         log,
		Validate:                    validate,
		SalesRepository:             salesRepository,
		SalesDetailRepository:       salesDetailRepository,
		TransactionDetailRepository: transactionDetailRepository,
	}
}

func (c *SalesUseCase) Search(ctx context.Context, request *model.SearchSalesRequest) ([]model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Preload("SalesDetails").Preload("TransactionDetails")

	sales, err := c.SalesRepository.Search(tx, request)
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

func (c *SalesUseCase) FindById(ctx context.Context, id int) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Preload("SalesDetails").Preload("TransactionDetails")
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(tx, sales, id); err != nil {
		return nil, fiber.ErrNotFound
	}
	return converter.SalesToResponse(sales), nil
}

func (c *SalesUseCase) Create(ctx context.Context, request *model.CreateSalesRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	sales := &entity.Sales{
		Customer:  request.Customer,
		IssuedAt:  time.Now(),
		IsPaidOff: false,
	}

	if err := c.SalesRepository.Create(tx, sales); err != nil {
		c.Log.WithError(err).Error("error creating sales")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("error committing transaction")
		return nil, fiber.ErrInternalServerError
	}

	return converter.SalesToResponse(sales), nil
}

func (c *SalesUseCase) AddSalesItem(ctx context.Context, salesId int, request *model.CreateSalesItemRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	// Verify Sale exists
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(tx, sales, salesId); err != nil {
		return nil, fiber.ErrNotFound
	}

	// Create Detail
	detail := &entity.SalesDetail{
		SalesID:     salesId,
		HarvestType: request.HarvestType,
		Weight:      request.Weight,
		Price:       request.Price,
	}

	if err := c.SalesDetailRepository.Create(tx, detail); err != nil {
		c.Log.WithError(err).Error("error creating sales detail")
		return nil, fiber.ErrInternalServerError
	}

	// Re-fetch sale to check payment status (optional here, but good practice if logic becomes complex)
	// For now just adding item doesn't change Paid status unless we want to AUTO-UNPAY if total grows?
	// Requirement: "Payment logic... user can add multiple payment until all total payment paid off."
	// If we add an item, the total grows. If it was paid off, it might become unpaid.
	// Let's re-evaluate status.

	// But first, commit the item creation.
	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	// Fetch updated sale to calculate and potentially update status
	return c.recalculateStatusAndReturn(ctx, salesId)
}

func (c *SalesUseCase) AddPayment(ctx context.Context, salesId int, request *model.CreatePaymentRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	// Verify Sale exists
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(tx, sales, salesId); err != nil {
		return nil, fiber.ErrNotFound
	}

	// Create Transaction
	transaction := &entity.TransactionDetail{
		SalesID: salesId,
		Amount:  request.Amount,
		PaidAt:  time.Now(),
	}

	if err := c.TransactionDetailRepository.Create(tx, transaction); err != nil {
		c.Log.WithError(err).Error("error creating transaction detail")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return c.recalculateStatusAndReturn(ctx, salesId)
}

func (c *SalesUseCase) UpdateSalesItem(ctx context.Context, itemId int, request *model.CreateSalesItemRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	detail := new(entity.SalesDetail)
	if err := c.SalesDetailRepository.FindById(tx, detail, itemId); err != nil {
		return nil, fiber.ErrNotFound
	}

	detail.HarvestType = request.HarvestType
	detail.Weight = request.Weight
	detail.Price = request.Price

	if err := c.SalesDetailRepository.Update(tx, detail); err != nil {
		c.Log.WithError(err).Error("error updating sales detail")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return c.recalculateStatusAndReturn(ctx, detail.SalesID)
}

func (c *SalesUseCase) DeleteSalesItem(ctx context.Context, itemId int) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	detail := new(entity.SalesDetail)
	if err := c.SalesDetailRepository.FindById(tx, detail, itemId); err != nil {
		return nil, fiber.ErrNotFound
	}

	salesId := detail.SalesID

	if err := c.SalesDetailRepository.Delete(tx, detail); err != nil {
		c.Log.WithError(err).Error("error deleting sales detail")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return c.recalculateStatusAndReturn(ctx, salesId)
}

func (c *SalesUseCase) UpdatePayment(ctx context.Context, paymentId int, request *model.CreatePaymentRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	payment := new(entity.TransactionDetail)
	if err := c.TransactionDetailRepository.FindById(tx, payment, paymentId); err != nil {
		return nil, fiber.ErrNotFound
	}

	payment.Amount = request.Amount

	if err := c.TransactionDetailRepository.Update(tx, payment); err != nil {
		c.Log.WithError(err).Error("error updating payment")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return c.recalculateStatusAndReturn(ctx, payment.SalesID)
}

func (c *SalesUseCase) DeletePayment(ctx context.Context, paymentId int) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	payment := new(entity.TransactionDetail)
	if err := c.TransactionDetailRepository.FindById(tx, payment, paymentId); err != nil {
		return nil, fiber.ErrNotFound
	}

	salesId := payment.SalesID

	if err := c.TransactionDetailRepository.Delete(tx, payment); err != nil {
		c.Log.WithError(err).Error("error deleting payment")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return c.recalculateStatusAndReturn(ctx, salesId)
}

func (c *SalesUseCase) recalculateStatusAndReturn(ctx context.Context, salesId int) (*model.SalesResponse, error) {
	// Re-fetch everything with preloads
	tx := c.DB.WithContext(ctx).Preload("SalesDetails").Preload("TransactionDetails")
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(tx, sales, salesId); err != nil {
		return nil, fiber.ErrInternalServerError
	}

	response := converter.SalesToResponse(sales)

	// Check if fully paid
	if response.TotalPaid >= response.TotalAmount && response.TotalAmount > 0 {
		if !sales.IsPaidOff {
			now := time.Now()
			sales.IsPaidOff = true
			sales.PaidOffAt = &now
			c.SalesRepository.Update(tx, sales)
			response.IsPaidOff = true
			response.PaidOffAt = &now
		}
	} else {
		if sales.IsPaidOff {
			sales.IsPaidOff = false
			sales.PaidOffAt = nil
			c.SalesRepository.Update(tx, sales)
			response.IsPaidOff = false
			response.PaidOffAt = nil
		}
	}

	return response, nil
}
