package usecase

import (
	"context"
	"sort"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type StockUseCase struct {
	DB  *gorm.DB
	Log *logrus.Logger
}

func NewStockUseCase(db *gorm.DB, log *logrus.Logger) *StockUseCase {
	return &StockUseCase{DB: db, Log: log}
}

type stockKey struct {
	bagangID    string
	harvestType string
}

type stockValue struct {
	stockIn  float64
	stockOut float64
}

func (c *StockUseCase) Summary(
	ctx context.Context,
	auth *model.Auth,
	seasonID int,
	bagangID string,
	harvestType string,
	startDate string,
	endDate string,
) ([]model.StockSummaryItem, error) {
	tx := c.DB.WithContext(ctx)
	season := new(entity.Season)
	if err := tx.Where("id = ?", seasonID).First(season).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fiber.ErrNotFound
		}
		c.Log.WithError(err).Error("error finding season for stock summary")
		return nil, fiber.ErrInternalServerError
	}

	scope, err := resolveReportBagangScope(tx, auth, bagangID)
	if err != nil {
		if _, ok := err.(*fiber.Error); ok {
			return nil, err
		}
		c.Log.WithError(err).Error("error resolving stock bagang scope")
		return nil, fiber.ErrInternalServerError
	}
	dateRange, err := buildReportDateRange(*season, startDate, endDate)
	if err != nil {
		return nil, err
	}
	normalizedFilter := normalizeFishType(harvestType)

	values := make(map[stockKey]stockValue)
	var harvests []entity.Harvest
	harvestQuery := dateRange.apply(tx.Where("harvests_season = ?", seasonID), "harvest_date")
	harvestQuery = scope.apply(harvestQuery, "bagang_id")
	if err := harvestQuery.Order("harvest_date asc").Find(&harvests).Error; err != nil {
		c.Log.WithError(err).Error("error fetching harvests for stock summary")
		return nil, fiber.ErrInternalServerError
	}
	for _, harvest := range harvests {
		typeKey := normalizeFishType(harvest.HarvestType)
		if normalizedFilter != "" && typeKey != normalizedFilter {
			continue
		}
		key := stockKey{bagangID: harvest.BagangID, harvestType: typeKey}
		value := values[key]
		value.stockIn += harvest.Weight
		values[key] = value
	}

	var sales []entity.Sales
	salesQuery := dateRange.apply(preloadSalesDetails(tx, scope), "issued_at")
	salesQuery = applySalesDetailScope(salesQuery, scope)
	if err := salesQuery.Order("issued_at asc").Find(&sales).Error; err != nil {
		c.Log.WithError(err).Error("error fetching sales for stock summary")
		return nil, fiber.ErrInternalServerError
	}
	for _, sale := range sales {
		for _, detail := range sale.SalesDetails {
			typeKey := normalizeFishType(detail.HarvestType)
			if normalizedFilter != "" && typeKey != normalizedFilter {
				continue
			}
			key := stockKey{bagangID: pointerValue(detail.BagangID), harvestType: typeKey}
			value := values[key]
			value.stockOut += detail.Weight
			values[key] = value
		}
	}

	return stockSummaryRows(values, scope), nil
}

func stockSummaryRows(values map[stockKey]stockValue, scope reportBagangScope) []model.StockSummaryItem {
	rows := make([]model.StockSummaryItem, 0, len(values))
	for key, value := range values {
		balance := value.stockIn - value.stockOut
		bagangID := stringPointer(key.bagangID)
		rows = append(rows, model.StockSummaryItem{
			BagangID:       bagangID,
			BagangName:     scope.name(key.bagangID),
			HarvestType:    key.harvestType,
			StockInKG:      value.stockIn,
			StockOutKG:     value.stockOut,
			StockBalanceKG: balance,
			IsNegative:     balance < 0,
		})
	}
	sort.Slice(rows, func(i, j int) bool {
		if rows[i].BagangName == rows[j].BagangName {
			return rows[i].HarvestType < rows[j].HarvestType
		}
		return rows[i].BagangName < rows[j].BagangName
	})
	return rows
}

func stringPointer(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}
