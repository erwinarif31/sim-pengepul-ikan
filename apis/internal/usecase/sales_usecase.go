package usecase

import (
	"context"
	"math"
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
	tx := c.DB.WithContext(ctx)
	scope, err := c.resolveSalesScope(tx, auth)
	if err != nil {
		return nil, err
	}
	tx = applySalesDetailScope(
		preloadSalesDetails(tx, reportBagangScope{}).Preload("TransactionDetails"),
		scope,
	)

	searchRequest := request
	if scope.filtered && request.IsPaidOff != nil {
		scopedRequest := *request
		scopedRequest.IsPaidOff = nil
		searchRequest = &scopedRequest
	}
	sales, err := c.SalesRepository.Search(tx, searchRequest)
	if err != nil {
		c.Log.WithError(err).Error("error searching sales")
		return nil, fiber.ErrInternalServerError
	}

	responses := make([]model.SalesResponse, 0, len(sales))
	for i := range sales {
		response := c.salesResponse(&sales[i], auth, scope)
		if request.IsPaidOff != nil && response.IsPaidOff != *request.IsPaidOff {
			continue
		}
		responses = append(responses, *response)
	}

	return responses, nil
}

func (c *SalesUseCase) FindById(ctx context.Context, auth *model.Auth, id int) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx)
	scope, err := c.resolveSalesScope(tx, auth)
	if err != nil {
		return nil, err
	}
	tx = applySalesDetailScope(
		preloadSalesDetails(tx, reportBagangScope{}).Preload("TransactionDetails"),
		scope,
	)
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(tx, sales, id); err != nil {
		return nil, fiber.ErrNotFound
	}
	return c.salesResponse(sales, auth, scope), nil
}

func (c *SalesUseCase) Create(ctx context.Context, auth *model.Auth, request *model.CreateSalesRequest) (*model.SalesResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := authorizeSalesMutation(auth); err != nil {
		return nil, err
	}
	if auth.Role != "ADMIN" {
		return nil, fiber.ErrForbidden
	}
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

	return c.salesResponse(sales, auth, reportBagangScope{}), nil
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
	if err := validateSalesDetailWeight(request.Weight); err != nil {
		return nil, err
	}

	// Verify Sale exists and is visible to the caller.
	scope, err := c.resolveSalesScope(tx, auth)
	if err != nil {
		return nil, err
	}
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(applySalesDetailScope(tx, scope), sales, salesId); err != nil {
		return nil, fiber.ErrNotFound
	}
	if err := c.authorizeSalesDetailBagang(tx, auth, &request.BagangID); err != nil {
		return nil, err
	}
	harvestType, err := canonicalHarvestType(tx, request.HarvestType)
	if err != nil {
		return nil, err
	}
	if err := validateSalesDetailStock(tx, 0, request.BagangID, harvestType, request.Weight); err != nil {
		return nil, err
	}

	// Create Detail
	detail := &entity.SalesDetail{
		SalesID:     salesId,
		BagangID:    &request.BagangID,
		HarvestType: harvestType,
		Weight:      request.Weight,
		Price:       request.Price,
	}

	if err := c.SalesDetailRepository.Create(tx, detail); err != nil {
		c.Log.WithError(err).Error("error creating sales detail")
		return nil, fiber.ErrInternalServerError
	}

	response, err := c.recalculateStatus(tx, auth, salesId)
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

	if err := authorizePaymentMutation(auth); err != nil {
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
	if err := c.authorizePaymentSale(tx, auth, salesId); err != nil {
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

	response, err := c.recalculateStatus(tx, auth, salesId)
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
	if err := validateSalesDetailWeight(request.Weight); err != nil {
		return nil, err
	}

	detail := new(entity.SalesDetail)
	if err := c.SalesDetailRepository.FindById(tx, detail, itemId); err != nil {
		return nil, fiber.ErrNotFound
	}
	if err := c.authorizeSalesDetailBagang(tx, auth, detail.BagangID); err != nil {
		return nil, err
	}
	if err := c.authorizeSalesDetailBagang(tx, auth, &request.BagangID); err != nil {
		return nil, err
	}
	harvestType, err := canonicalHarvestType(tx, request.HarvestType)
	if err != nil {
		return nil, err
	}
	if detail.BagangID != nil {
		if err := lockBagangRows(tx, *detail.BagangID, request.BagangID); err != nil {
			return nil, fiber.ErrNotFound
		}
	}
	if err := validateSalesDetailStock(tx, detail.ID, request.BagangID, harvestType, request.Weight); err != nil {
		return nil, err
	}

	detail.BagangID = &request.BagangID
	detail.HarvestType = harvestType
	detail.Weight = request.Weight
	detail.Price = request.Price

	if err := c.SalesDetailRepository.Update(tx, detail); err != nil {
		c.Log.WithError(err).Error("error updating sales detail")
		return nil, fiber.ErrInternalServerError
	}

	response, err := c.recalculateStatus(tx, auth, detail.SalesID)
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
	if err := c.authorizeSalesDetailBagang(tx, auth, detail.BagangID); err != nil {
		return nil, err
	}
	if detail.BagangID != nil {
		if err := lockBagangRow(tx, *detail.BagangID); err != nil {
			return nil, fiber.ErrNotFound
		}
	}

	if err := c.SalesDetailRepository.Delete(tx, detail); err != nil {
		c.Log.WithError(err).Error("error deleting sales detail")
		return nil, fiber.ErrInternalServerError
	}

	response, err := c.recalculateStatus(tx, auth, salesId)
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

	if err := authorizePaymentMutation(auth); err != nil {
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
	if err := c.authorizePaymentSale(tx, auth, payment.SalesID); err != nil {
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

	response, err := c.recalculateStatus(tx, auth, payment.SalesID)
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
	if err := authorizePaymentMutation(auth); err != nil {
		return nil, err
	}

	payment := new(entity.TransactionDetail)
	if err := c.TransactionDetailRepository.FindById(tx, payment, paymentId); err != nil {
		return nil, fiber.ErrNotFound
	}

	salesId := payment.SalesID
	if err := c.authorizePaymentSale(tx, auth, salesId); err != nil {
		return nil, err
	}
	if err := c.TransactionDetailRepository.Delete(tx, payment); err != nil {
		c.Log.WithError(err).Error("error deleting payment")
		return nil, fiber.ErrInternalServerError
	}

	response, err := c.recalculateStatus(tx, auth, salesId)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return response, nil
}

func (c *SalesUseCase) recalculateStatus(db *gorm.DB, auth *model.Auth, salesId int) (*model.SalesResponse, error) {
	sales := new(entity.Sales)
	if err := c.SalesRepository.FindById(db.Preload("SalesDetails").Preload("SalesDetails.Bagang").Preload("TransactionDetails"), sales, salesId); err != nil {
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
		sales.IsPaidOff = shouldBePaidOff
		sales.PaidOffAt = paidOffAt
	}

	scope, err := c.resolveSalesScope(db, auth)
	if err != nil {
		return nil, err
	}
	return c.salesResponse(sales, auth, scope), nil
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

func (c *SalesUseCase) resolveSalesScope(db *gorm.DB, auth *model.Auth) (reportBagangScope, error) {
	return resolveReportBagangScope(db, auth, "")
}

func (c *SalesUseCase) salesResponse(sales *entity.Sales, auth *model.Auth, scope reportBagangScope) *model.SalesResponse {
	response := converter.SalesToResponse(sales)
	if scope.filtered {
		visibleDetails := response.SalesDetails[:0]
		for _, detail := range response.SalesDetails {
			if detail.BagangID == nil || !bagangIDInScope(*detail.BagangID, scope) {
				continue
			}
			visibleDetails = append(visibleDetails, detail)
		}
		response.SalesDetails = visibleDetails
		response.TotalAmount, response.TotalPaid = calculateSaleTotalsForScope(*sales, scope)
		response.IsPaidOff = response.TotalAmount > 0 && response.TotalPaid >= response.TotalAmount
		response.PaymentsVisible = true
		response.PaidOffAt = nil
		response.TransactionDetails = nil
	} else if auth.Role != "ADMIN" {
		response.PaymentsVisible = false
		response.PaidOffAt = nil
		response.TransactionDetails = nil
		response.TotalPaid = 0
	}
	return response
}

func (c *SalesUseCase) authorizePaymentSale(db *gorm.DB, auth *model.Auth, salesID int) error {
	if auth == nil {
		return fiber.ErrUnauthorized
	}
	if auth.Role == "ADMIN" {
		return nil
	}
	if auth.Role != "OWNER" {
		return fiber.ErrForbidden
	}

	scope, err := c.resolveSalesScope(db, auth)
	if err != nil {
		return err
	}
	if len(scope.IDs) == 0 {
		return fiber.ErrForbidden
	}

	var ownedDetails int64
	if err := db.Model(&entity.SalesDetail{}).
		Where("sales_id = ? AND bagang_id IN ?", salesID, scope.IDs).
		Count(&ownedDetails).Error; err != nil {
		c.Log.WithError(err).Error("error checking payment bagang scope")
		return fiber.ErrInternalServerError
	}
	if ownedDetails == 0 {
		return fiber.ErrForbidden
	}
	return nil
}

func (c *SalesUseCase) authorizeSalesDetailBagang(db *gorm.DB, auth *model.Auth, bagangID *string) error {
	if auth == nil {
		return fiber.ErrUnauthorized
	}
	if auth.Role == "ADMIN" {
		return nil
	}
	if bagangID == nil || *bagangID == "" {
		return fiber.ErrForbidden
	}
	bagang := new(entity.Bagang)
	if err := c.BagangRepository.FindById(db.Preload("Worker").Preload("Owner"), bagang, *bagangID); err != nil {
		return fiber.ErrNotFound
	}
	if !bagangInScope(auth, bagang) {
		return fiber.ErrForbidden
	}
	return nil
}

func canonicalHarvestType(tx *gorm.DB, requested string) (string, error) {
	var harvestType entity.HarvestType
	if err := tx.Where("LOWER(TRIM(name)) = ?", normalizeFishType(requested)).First(&harvestType).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", fiber.NewError(fiber.StatusBadRequest, "invalid harvest type")
		}
		return "", fiber.ErrInternalServerError
	}
	return harvestType.Name, nil
}

func validateSalesDetailWeight(weight float64) error {
	if weight > 999999999.999 || math.Abs(weight-math.Round(weight*1000)/1000) > 1e-9 {
		return fiber.NewError(fiber.StatusBadRequest, "weight must use at most 3 decimal places")
	}
	return nil
}

func validateSalesDetailStock(tx *gorm.DB, detailID int, bagangID, harvestType string, weight float64) error {
	if err := lockBagangRow(tx, bagangID); err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.ErrNotFound
		}
		return fiber.ErrInternalServerError
	}

	normalizedHarvestType := normalizeFishType(harvestType)
	var stockIn float64
	if err := tx.Model(&entity.Harvest{}).
		Where("bagang_id = ? AND LOWER(TRIM(harvest_type)) = ?", bagangID, normalizedHarvestType).
		Select("COALESCE(SUM(weight), 0)").
		Scan(&stockIn).Error; err != nil {
		return fiber.ErrInternalServerError
	}

	salesQuery := tx.Model(&entity.SalesDetail{}).
		Where("bagang_id = ? AND LOWER(TRIM(harvest_types)) = ?", bagangID, normalizedHarvestType)
	if detailID > 0 {
		salesQuery = salesQuery.Where("id <> ?", detailID)
	}
	var stockOut float64
	if err := salesQuery.Select("COALESCE(SUM(weight), 0)").Scan(&stockOut).Error; err != nil {
		return fiber.ErrInternalServerError
	}

	if !hasSufficientStock(stockIn, stockOut, weight) {
		return fiber.NewError(fiber.StatusBadRequest, "insufficient stock for selected bagang and harvest type")
	}
	return nil
}

func hasSufficientStock(stockIn, stockOut, requestedWeight float64) bool {
	return stockOut+requestedWeight <= stockIn+1e-9
}

func authorizePaymentMutation(auth *model.Auth) error {
	if auth == nil {
		return fiber.ErrUnauthorized
	}
	if auth.Role != "ADMIN" && auth.Role != "OWNER" {
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
