package usecase

import (
	"context"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type FinancialReportUseCase struct {
	DB  *gorm.DB
	Log *logrus.Logger
}

func NewFinancialReportUseCase(db *gorm.DB, log *logrus.Logger) *FinancialReportUseCase {
	return &FinancialReportUseCase{DB: db, Log: log}
}

func (c *FinancialReportUseCase) Generate(
	ctx context.Context,
	auth *model.Auth,
	seasonID int,
	bagangID string,
	startDate string,
	endDate string,
) (*model.FinancialReportResponse, error) {
	if err := financialReportRoleAllowed(auth); err != nil {
		return nil, err
	}

	tx := c.DB.WithContext(ctx)
	season := new(entity.Season)
	if err := tx.Where("id = ?", seasonID).First(season).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fiber.ErrNotFound
		}
		c.Log.WithError(err).Error("error finding season for financial report")
		return nil, fiber.ErrInternalServerError
	}

	scope, err := resolveReportBagangScope(tx, auth, bagangID)
	if err != nil {
		if _, ok := err.(*fiber.Error); ok {
			return nil, err
		}
		c.Log.WithError(err).Error("error resolving financial report bagang scope")
		return nil, fiber.ErrInternalServerError
	}
	dateRange, err := buildReportDateRange(*season, startDate, endDate)
	if err != nil {
		return nil, err
	}

	var sales []entity.Sales
	salesQuery := dateRange.apply(preloadSalesDetails(tx, reportBagangScope{}).Preload("TransactionDetails"), "issued_at")
	salesQuery = applySalesDetailScope(salesQuery, scope)
	if err := salesQuery.Order("issued_at asc").Find(&sales).Error; err != nil {
		c.Log.WithError(err).Error("error fetching sales for financial report")
		return nil, fiber.ErrInternalServerError
	}

	var costs []entity.ProductionCost
	costQuery := dateRange.apply(tx.Where("production_costs_season = ?", seasonID), "created_at")
	costQuery = scope.apply(costQuery, "bagang_id")
	if err := costQuery.Order("created_at asc").Find(&costs).Error; err != nil {
		c.Log.WithError(err).Error("error fetching production costs for financial report")
		return nil, fiber.ErrInternalServerError
	}

	response := &model.FinancialReportResponse{
		Sales:           make([]model.FinancialSaleItem, 0, len(sales)),
		ProductionCosts: make([]model.FinancialProductionCostItem, 0, len(costs)),
	}
	response.TotalSalesRevenue, response.TotalPaid, response.AccountsReceivable = calculateSalesTotalsForScope(sales, scope)
	for _, sale := range sales {
		salesRevenue, totalPaid := calculateSaleTotalsForScope(sale, scope)
		response.Sales = append(response.Sales, model.FinancialSaleItem{
			ID:                 sale.ID,
			Customer:           sale.Customer,
			BagangName:         salesBagangNames(sale, scope),
			IssuedAt:           sale.IssuedAt,
			TotalSalesRevenue:  salesRevenue,
			TotalPaid:          totalPaid,
			AccountsReceivable: calculateSaleReceivable(salesRevenue, totalPaid),
		})
	}
	for _, cost := range costs {
		response.TotalProductionCost += cost.Price
		response.ProductionCosts = append(response.ProductionCosts, model.FinancialProductionCostItem{
			ID:                 cost.ID,
			BagangID:           cost.BagangID,
			BagangName:         scope.name(cost.BagangID),
			ProductionCostType: cost.ProductionCostType,
			CreatedAt:          cost.CreatedAt,
			Amount:             cost.Price,
		})
	}

	response.NetProfit = calculateNetProfit(response.TotalSalesRevenue, response.TotalProductionCost)
	response.ProfitMargin = calculateProfitMargin(response.TotalSalesRevenue, response.NetProfit)
	return response, nil
}

func calculateSaleTotals(sale entity.Sales) (int, int) {
	totalRevenue := 0
	for _, detail := range sale.SalesDetails {
		totalRevenue += calculateSaleDetailValue(detail.Weight, detail.Price)
	}
	totalPaid := 0
	for _, payment := range sale.TransactionDetails {
		totalPaid += payment.Amount
	}
	return totalRevenue, totalPaid
}

func pointerValue(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
