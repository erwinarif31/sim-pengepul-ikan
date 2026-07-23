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
	BagangRepository            *repository.BagangRepository
}

func NewSalesUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	salesRepository *repository.SalesRepository,
	salesDetailRepository *repository.SalesDetailRepository,
	transactionDetailRepository *repository.TransactionDetailRepository,
	bagangRepository *repository.BagangRepository,
) *SalesUseCase {
	return &SalesUseCase{
		DB:                          db,
		Log:                         log,
		Validate:                    validate,
		SalesRepository:             salesRepository,
		SalesDetailRepository:       salesDetailRepository,
		TransactionDetailRepository: transactionDetailRepository,
		BagangRepository:            bagangRepository,
	}
}

func (c *SalesUseCase) Search(ctx context.Context, auth *model.Auth, request *model.SearchSalesRequest) ([]model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Preload("SalesDetails").Preload("TransactionDetails").Preload("Bagang")
	if err := c.applySalesScope(tx, auth, request); err != nil {
		return nil, err
	}

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

func (c *SalesUseCase) FindById(ctx context.Context, auth *model.Auth, id int) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Preload("SalesDetails").Preload("TransactionDetails").Preload("Bagang")
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(tx, sales, id); err != nil {
		return nil, fiber.ErrNotFound
	}
	if err := c.authorizeSales(tx, auth, sales); err != nil {
		return nil, err
	}
	return converter.SalesToResponse(sales), nil
}

func (c *SalesUseCase) Create(ctx context.Context, auth *model.Auth, request *model.CreateSalesRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := authorizeSalesMutation(auth); err != nil {
		return nil, err
	}
	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
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

	sales := &entity.Sales{
		Customer:  request.Customer,
		BagangID:  &request.BagangID,
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

	sales.Bagang = bagang
	return converter.SalesToResponse(sales), nil
}

func (c *SalesUseCase) AddSalesItem(ctx context.Context, auth *model.Auth, salesId int, request *model.CreateSalesItemRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := authorizeSalesMutation(auth); err != nil {
		return nil, err
	}
	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	// Verify Sale exists
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(tx, sales, salesId); err != nil {
		return nil, fiber.ErrNotFound
	}
	if err := c.authorizeSales(tx, auth, sales); err != nil {
		return nil, err
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

	response, err := c.recalculateStatus(tx, salesId)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return response, nil
}

func (c *SalesUseCase) AddPayment(ctx context.Context, auth *model.Auth, salesId int, request *model.CreatePaymentRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := authorizeSalesMutation(auth); err != nil {
		return nil, err
	}
	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	// Verify Sale exists
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(tx, sales, salesId); err != nil {
		return nil, fiber.ErrNotFound
	}
	if err := c.authorizeSales(tx, auth, sales); err != nil {
		return nil, err
	}
	if err := c.validatePaymentAmount(tx, salesId, request.Amount, 0); err != nil {
		return nil, err
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

	response, err := c.recalculateStatus(tx, salesId)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return response, nil
}

func (c *SalesUseCase) UpdateSalesItem(ctx context.Context, auth *model.Auth, itemId int, request *model.CreateSalesItemRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := authorizeSalesMutation(auth); err != nil {
		return nil, err
	}
	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	detail := new(entity.SalesDetail)
	if err := c.SalesDetailRepository.FindById(tx, detail, itemId); err != nil {
		return nil, fiber.ErrNotFound
	}
	if err := c.authorizeSalesID(tx, auth, detail.SalesID); err != nil {
		return nil, err
	}

	detail.HarvestType = request.HarvestType
	detail.Weight = request.Weight
	detail.Price = request.Price

	if err := c.SalesDetailRepository.Update(tx, detail); err != nil {
		c.Log.WithError(err).Error("error updating sales detail")
		return nil, fiber.ErrInternalServerError
	}

	response, err := c.recalculateStatus(tx, detail.SalesID)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return response, nil
}

func (c *SalesUseCase) DeleteSalesItem(ctx context.Context, auth *model.Auth, itemId int) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()
	if err := authorizeSalesMutation(auth); err != nil {
		return nil, err
	}

	detail := new(entity.SalesDetail)
	if err := c.SalesDetailRepository.FindById(tx, detail, itemId); err != nil {
		return nil, fiber.ErrNotFound
	}

	salesId := detail.SalesID
	if err := c.authorizeSalesID(tx, auth, salesId); err != nil {
		return nil, err
	}

	if err := c.SalesDetailRepository.Delete(tx, detail); err != nil {
		c.Log.WithError(err).Error("error deleting sales detail")
		return nil, fiber.ErrInternalServerError
	}

	response, err := c.recalculateStatus(tx, salesId)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return response, nil
}

func (c *SalesUseCase) UpdatePayment(ctx context.Context, auth *model.Auth, paymentId int, request *model.CreatePaymentRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := authorizeSalesMutation(auth); err != nil {
		return nil, err
	}
	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	payment := new(entity.TransactionDetail)
	if err := c.TransactionDetailRepository.FindById(tx, payment, paymentId); err != nil {
		return nil, fiber.ErrNotFound
	}
	if err := c.authorizeSalesID(tx, auth, payment.SalesID); err != nil {
		return nil, err
	}
	if err := c.validatePaymentAmount(tx, payment.SalesID, request.Amount, paymentId); err != nil {
		return nil, err
	}

	payment.Amount = request.Amount

	if err := c.TransactionDetailRepository.Update(tx, payment); err != nil {
		c.Log.WithError(err).Error("error updating payment")
		return nil, fiber.ErrInternalServerError
	}

	response, err := c.recalculateStatus(tx, payment.SalesID)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return response, nil
}

func (c *SalesUseCase) DeletePayment(ctx context.Context, auth *model.Auth, paymentId int) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()
	if err := authorizeSalesMutation(auth); err != nil {
		return nil, err
	}

	payment := new(entity.TransactionDetail)
	if err := c.TransactionDetailRepository.FindById(tx, payment, paymentId); err != nil {
		return nil, fiber.ErrNotFound
	}

	salesId := payment.SalesID
	if err := c.authorizeSalesID(tx, auth, salesId); err != nil {
		return nil, err
	}

	if err := c.TransactionDetailRepository.Delete(tx, payment); err != nil {
		c.Log.WithError(err).Error("error deleting payment")
		return nil, fiber.ErrInternalServerError
	}

	response, err := c.recalculateStatus(tx, salesId)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return response, nil
}

func (c *SalesUseCase) recalculateStatus(db *gorm.DB, salesId int) (*model.SalesResponse, error) {
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(db.Preload("SalesDetails").Preload("TransactionDetails").Preload("Bagang"), sales, salesId); err != nil {
		return nil, fiber.ErrInternalServerError
	}

	response := converter.SalesToResponse(sales)

	// Check if fully paid
	shouldBePaidOff := response.TotalPaid >= response.TotalAmount && response.TotalAmount > 0

	if shouldBePaidOff != sales.IsPaidOff {
		var paidOffAt *time.Time
		if shouldBePaidOff {
			now := time.Now()
			paidOffAt = &now
		}

		if err := db.Model(&entity.Sales{}).Where("id = ?", salesId).Updates(map[string]any{
			"is_paid_off": shouldBePaidOff,
			"paid_off_at": paidOffAt,
		}).Error; err != nil {
			c.Log.WithError(err).Error("error updating sales status")
			return nil, fiber.ErrInternalServerError
		}

		// Update response to match new state
		response.IsPaidOff = shouldBePaidOff
		response.PaidOffAt = paidOffAt
	}

	return response, nil
}

func (c *SalesUseCase) validatePaymentAmount(db *gorm.DB, salesId int, amount int, ignoredPaymentId int) error {
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(db.Preload("SalesDetails").Preload("TransactionDetails"), sales, salesId); err != nil {
		return fiber.ErrNotFound
	}

	response := converter.SalesToResponse(sales)
	if response.TotalAmount <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "sale has no payable items")
	}

	totalPaid := response.TotalPaid
	if ignoredPaymentId != 0 {
		for _, transaction := range sales.TransactionDetails {
			if transaction.ID == ignoredPaymentId {
				totalPaid -= transaction.Amount
				break
			}
		}
	}

	if totalPaid+amount > response.TotalAmount {
		return fiber.NewError(fiber.StatusBadRequest, "payment exceeds remaining balance")
	}
	return nil
}

func (c *SalesUseCase) applySalesScope(db *gorm.DB, auth *model.Auth, request *model.SearchSalesRequest) error {
	if auth == nil {
		return fiber.ErrUnauthorized
	}
	if auth.Role == "ADMIN" {
		return nil
	}
	if auth.WorkerID == nil {
		return fiber.ErrForbidden
	}

	var bagangIDs []string
	query := db.Model(&entity.Bagang{})
	if auth.Role == "OWNER" {
		query = query.Where("owner_id = ?", *auth.WorkerID)
	} else if auth.Role == "WORKER" {
		query = query.Where("worker_id = ?", *auth.WorkerID)
	} else {
		return fiber.ErrUnauthorized
	}
	if request.BagangID != "" {
		query = query.Where("id = ?", request.BagangID)
	}
	if err := query.Pluck("id", &bagangIDs).Error; err != nil {
		c.Log.WithError(err).Error("error resolving scoped bagangs for sales")
		return fiber.ErrInternalServerError
	}
	request.BagangID = ""
	request.BagangIDs = bagangIDs
	return nil
}

func (c *SalesUseCase) authorizeSalesID(db *gorm.DB, auth *model.Auth, salesID int) error {
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(db, sales, salesID); err != nil {
		return fiber.ErrNotFound
	}
	return c.authorizeSales(db, auth, sales)
}

func (c *SalesUseCase) authorizeSales(db *gorm.DB, auth *model.Auth, sales *entity.Sales) error {
	if auth == nil {
		return fiber.ErrUnauthorized
	}
	if auth.Role == "ADMIN" {
		return nil
	}
	if sales.BagangID == nil || *sales.BagangID == "" {
		return fiber.ErrForbidden
	}
	bagang := new(entity.Bagang)
	if err := c.BagangRepository.FindById(db.Preload("Worker").Preload("Owner"), bagang, *sales.BagangID); err != nil {
		c.Log.WithError(err).Error("error finding sales bagang")
		return fiber.ErrNotFound
	}
	if !bagangInScope(auth, bagang) {
		return fiber.ErrForbidden
	}
	return nil
}

func authorizeSalesMutation(auth *model.Auth) error {
	if auth == nil {
		return fiber.ErrUnauthorized
	}
	if auth.Role == "WORKER" {
		return fiber.ErrForbidden
	}
	if auth.Role != "ADMIN" && auth.Role != "OWNER" {
		return fiber.ErrUnauthorized
	}
	return nil
}
