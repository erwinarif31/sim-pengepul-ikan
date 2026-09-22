package usecase

import (
	"context"
	"sort"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type DashboardUseCase struct {
	DB                       *gorm.DB
	Log                      *logrus.Logger
	HarvestRepository        *repository.HarvestRepository
	ProductionCostRepository *repository.ProductionCostRepository
	BagangRepository         *repository.BagangRepository
	SalesRepository          *repository.SalesRepository
	SeasonRepository         *repository.SeasonRepository
}

func NewDashboardUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	harvestRepository *repository.HarvestRepository,
	productionCostRepository *repository.ProductionCostRepository,
	bagangRepository *repository.BagangRepository,
	salesRepository *repository.SalesRepository,
	seasonRepository *repository.SeasonRepository,
) *DashboardUseCase {
	return &DashboardUseCase{
		DB:                       db,
		Log:                      log,
		HarvestRepository:        harvestRepository,
		ProductionCostRepository: productionCostRepository,
		BagangRepository:         bagangRepository,
		SalesRepository:          salesRepository,
		SeasonRepository:         seasonRepository,
	}
}

func (c *DashboardUseCase) GetMetrics(ctx context.Context, auth *model.Auth, seasonID int) (*model.DashboardMetricsResponse, error) {
	tx := c.DB.WithContext(ctx)
	season := new(entity.Season)
	if err := tx.Where("id = ?", seasonID).First(season).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fiber.ErrNotFound
		}
		c.Log.WithError(err).Error("error fetching season for metrics")
		return nil, fiber.ErrInternalServerError
	}

	scope, err := resolveReportBagangScope(tx, auth, "")
	if err != nil {
		return nil, dashboardScopeError(c.Log, err, "error resolving dashboard scope")
	}

	var harvests []entity.Harvest
	harvestQuery := scope.apply(tx.Where("harvests_season = ?", seasonID), "bagang_id")
	if err := harvestQuery.Find(&harvests).Error; err != nil {
		c.Log.WithError(err).Error("error fetching harvests for metrics")
		return nil, fiber.ErrInternalServerError
	}
	totalHarvestValue := 0
	activeBagangs := make(map[string]bool)
	for _, harvest := range harvests {
		totalHarvestValue += calculateHarvestValue(harvest.Price, harvest.Weight)
		activeBagangs[harvest.BagangID] = true
	}

	var costs []entity.ProductionCost
	costQuery := scope.apply(tx.Where("production_costs_season = ?", seasonID), "bagang_id")
	if err := costQuery.Find(&costs).Error; err != nil {
		c.Log.WithError(err).Error("error fetching production costs for metrics")
		return nil, fiber.ErrInternalServerError
	}
	totalCosts := 0
	for _, cost := range costs {
		totalCosts += cost.Price
	}

	dateRange, err := buildReportDateRange(*season, "", "")
	if err != nil {
		return nil, err
	}
	var sales []entity.Sales
	salesQuery := dateRange.apply(preloadSalesDetails(tx, reportBagangScope{}).Preload("TransactionDetails"), "issued_at")
	salesQuery = applySalesDetailScope(salesQuery, scope)
	if err := salesQuery.Find(&sales).Error; err != nil {
		c.Log.WithError(err).Error("error fetching sales for metrics")
		return nil, fiber.ErrInternalServerError
	}
	totalSalesRevenue, totalPaid, accountsReceivable := calculateSalesTotalsForScope(sales, scope)

	netProfit := calculateNetProfit(totalSalesRevenue, totalHarvestValue)
	profitMargin := calculateProfitMargin(totalSalesRevenue, netProfit)
	activeBagangCount := len(activeBagangs)
	avgProfitPerBagang := 0
	if activeBagangCount > 0 {
		avgProfitPerBagang = netProfit / activeBagangCount
	}

	return &model.DashboardMetricsResponse{
		TotalHarvestValue:  totalHarvestValue,
		TotalCosts:         totalCosts,
		TotalSalesRevenue:  totalSalesRevenue,
		TotalPaid:          totalPaid,
		AccountsReceivable: accountsReceivable,
		NetProfit:          netProfit,
		ProfitMargin:       profitMargin,
		AvgProfitPerBagang: avgProfitPerBagang,
		ActiveBagangCount:  activeBagangCount,
	}, nil
}

func (c *DashboardUseCase) GetHarvestTrend(ctx context.Context, auth *model.Auth, seasonID int) (*model.HarvestTrendResponse, error) {
	tx := c.DB.WithContext(ctx)
	if _, err := c.loadSeason(tx, seasonID, "error fetching season for harvest trend"); err != nil {
		return nil, err
	}
	scope, err := resolveReportBagangScope(tx, auth, "")
	if err != nil {
		return nil, dashboardScopeError(c.Log, err, "error resolving harvest trend scope")
	}

	var harvests []entity.Harvest
	query := scope.apply(tx.Where("harvests_season = ?", seasonID).Order("harvest_date asc"), "bagang_id")
	if err := query.Find(&harvests).Error; err != nil {
		c.Log.WithError(err).Error("error fetching harvests for trend")
		return nil, fiber.ErrInternalServerError
	}

	monthlyData := make(map[string]int)
	monthOrder := make([]string, 0)
	for _, harvest := range harvests {
		monthKey := harvest.HarvestDate.Format("Jan 2006")
		if _, exists := monthlyData[monthKey]; !exists {
			monthOrder = append(monthOrder, monthKey)
		}
		monthlyData[monthKey] += calculateHarvestValue(harvest.Price, harvest.Weight)
	}

	data := make([]model.HarvestTrendItem, 0, len(monthOrder))
	for _, month := range monthOrder {
		data = append(data, model.HarvestTrendItem{
			Month:        month,
			HarvestValue: monthlyData[month],
		})
	}
	return &model.HarvestTrendResponse{Data: data}, nil
}

func (c *DashboardUseCase) GetHarvestByType(ctx context.Context, auth *model.Auth, seasonID int) (*model.HarvestByTypeResponse, error) {
	tx := c.DB.WithContext(ctx)
	if _, err := c.loadSeason(tx, seasonID, "error fetching season for harvest type"); err != nil {
		return nil, err
	}
	scope, err := resolveReportBagangScope(tx, auth, "")
	if err != nil {
		return nil, dashboardScopeError(c.Log, err, "error resolving harvest type scope")
	}

	var harvests []entity.Harvest
	query := scope.apply(tx.Where("harvests_season = ?", seasonID), "bagang_id")
	if err := query.Find(&harvests).Error; err != nil {
		c.Log.WithError(err).Error("error fetching harvests by type")
		return nil, fiber.ErrInternalServerError
	}

	typeData := make(map[string]int)
	for _, harvest := range harvests {
		typeData[normalizeFishType(harvest.HarvestType)] += calculateHarvestValue(harvest.Price, harvest.Weight)
	}
	data := make([]model.HarvestByTypeItem, 0, len(typeData))
	for harvestType, value := range typeData {
		data = append(data, model.HarvestByTypeItem{
			Type:         harvestType,
			HarvestValue: value,
		})
	}
	sort.Slice(data, func(i, j int) bool {
		return data[i].HarvestValue > data[j].HarvestValue
	})
	return &model.HarvestByTypeResponse{Data: data}, nil
}

func (c *DashboardUseCase) GetBagangPerformance(ctx context.Context, auth *model.Auth, seasonID int, limit int) (*model.BagangPerformanceResponse, error) {
	tx := c.DB.WithContext(ctx)
	scope, err := resolveReportBagangScope(tx, auth, "")
	if err != nil {
		return nil, dashboardScopeError(c.Log, err, "error resolving bagang performance scope")
	}
	season := new(entity.Season)
	if err := tx.Where("id = ?", seasonID).First(season).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fiber.ErrNotFound
		}
		c.Log.WithError(err).Error("error fetching season for bagang performance")
		return nil, fiber.ErrInternalServerError
	}
	dateRange, err := buildReportDateRange(*season, "", "")
	if err != nil {
		return nil, err
	}

	type performanceValue struct {
		harvestValue   int
		salesRevenue   int
		productionCost int
	}
	values := make(map[string]performanceValue)

	var harvests []entity.Harvest
	harvestQuery := scope.apply(tx.Where("harvests_season = ?", seasonID), "bagang_id")
	if err := harvestQuery.Find(&harvests).Error; err != nil {
		c.Log.WithError(err).Error("error fetching harvests for bagang performance")
		return nil, fiber.ErrInternalServerError
	}
	for _, harvest := range harvests {
		value := values[harvest.BagangID]
		value.harvestValue += calculateHarvestValue(harvest.Price, harvest.Weight)
		values[harvest.BagangID] = value
	}

	var costs []entity.ProductionCost
	costQuery := scope.apply(tx.Where("production_costs_season = ?", seasonID), "bagang_id")
	if err := costQuery.Find(&costs).Error; err != nil {
		c.Log.WithError(err).Error("error fetching costs for bagang performance")
		return nil, fiber.ErrInternalServerError
	}
	for _, cost := range costs {
		value := values[cost.BagangID]
		value.productionCost += cost.Price
		values[cost.BagangID] = value
	}

	var sales []entity.Sales
	salesQuery := dateRange.apply(preloadSalesDetails(tx, reportBagangScope{}), "issued_at")
	salesQuery = applySalesDetailScope(salesQuery, scope)
	if err := salesQuery.Find(&sales).Error; err != nil {
		c.Log.WithError(err).Error("error fetching sales for bagang performance")
		return nil, fiber.ErrInternalServerError
	}
	for _, sale := range sales {
		for _, detail := range sale.SalesDetails {
			if !detailInBagangScope(detail, scope) {
				continue
			}
			bagangID := pointerValue(detail.BagangID)
			value := values[bagangID]
			value.salesRevenue += calculateSaleDetailValue(detail.Weight, detail.Price)
			values[bagangID] = value
		}
	}

	data := make([]model.BagangPerformanceItem, 0, len(values))
	for bagangID, value := range values {
		if bagangID != "" && scope.Names[bagangID] == "" {
			continue
		}
		data = append(data, model.BagangPerformanceItem{
			BagangID:       stringPointer(bagangID),
			BagangName:     scope.name(bagangID),
			HarvestValue:   value.harvestValue,
			SalesRevenue:   value.salesRevenue,
			ProductionCost: value.productionCost,
			NetProfit:      value.salesRevenue - value.harvestValue,
		})
	}
	sort.Slice(data, func(i, j int) bool {
		if data[i].NetProfit == data[j].NetProfit {
			return data[i].BagangName < data[j].BagangName
		}
		return data[i].NetProfit > data[j].NetProfit
	})
	if limit > 0 && len(data) > limit {
		data = data[:limit]
	}
	return &model.BagangPerformanceResponse{Data: data}, nil
}

func (c *DashboardUseCase) GetRecentSales(ctx context.Context, auth *model.Auth, seasonID int, limit int) (*model.RecentSalesResponse, error) {
	tx := c.DB.WithContext(ctx)
	season := new(entity.Season)
	if err := tx.Where("id = ?", seasonID).First(season).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fiber.ErrNotFound
		}
		c.Log.WithError(err).Error("error fetching season for recent sales")
		return nil, fiber.ErrInternalServerError
	}
	scope, err := resolveReportBagangScope(tx, auth, "")
	if err != nil {
		return nil, dashboardScopeError(c.Log, err, "error resolving recent sales scope")
	}
	dateRange, err := buildReportDateRange(*season, "", "")
	if err != nil {
		return nil, err
	}

	query := dateRange.apply(preloadSalesDetails(tx, reportBagangScope{}).Preload("TransactionDetails"), "issued_at")
	query = applySalesDetailScope(query, scope).Order("issued_at desc")
	if limit > 0 {
		query = query.Limit(limit)
	}
	var sales []entity.Sales
	if err := query.Find(&sales).Error; err != nil {
		c.Log.WithError(err).Error("error fetching recent sales")
		return nil, fiber.ErrInternalServerError
	}

	data := make([]model.RecentSaleItem, len(sales))
	for i, sale := range sales {
		totalAmount, totalPaid := calculateSaleTotalsForScope(sale, scope)
		isPaidOff := sale.IsPaidOff
		if scope.filtered {
			isPaidOff = totalAmount > 0 && totalPaid >= totalAmount
		}
		data[i] = model.RecentSaleItem{
			ID:          sale.ID,
			Customer:    sale.Customer,
			BagangName:  salesBagangNames(sale, scope),
			IssuedAt:    sale.IssuedAt.Format("2006-01-02"),
			TotalAmount: totalAmount,
			TotalPaid:   totalPaid,
			IsPaidOff:   isPaidOff,
		}
	}
	return &model.RecentSalesResponse{Data: data}, nil
}

func dashboardScopeError(log *logrus.Logger, err error, message string) error {
	if _, ok := err.(*fiber.Error); ok {
		return err
	}
	log.WithError(err).Error(message)
	return fiber.ErrInternalServerError
}

func (c *DashboardUseCase) loadSeason(db *gorm.DB, seasonID int, message string) (*entity.Season, error) {
	season := new(entity.Season)
	if err := db.Where("id = ?", seasonID).First(season).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fiber.ErrNotFound
		}
		c.Log.WithError(err).Error(message)
		return nil, fiber.ErrInternalServerError
	}
	return season, nil
}
