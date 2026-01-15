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

// GetMetrics returns KPI overview for a specific season
func (c *DashboardUseCase) GetMetrics(ctx context.Context, seasonID int) (*model.DashboardMetricsResponse, error) {
	tx := c.DB.WithContext(ctx)

	// Get total harvest revenue and count active bagangs
	var harvests []entity.Harvest
	if err := tx.Where("harvests_season = ?", seasonID).Find(&harvests).Error; err != nil {
		c.Log.WithError(err).Error("error fetching harvests for metrics")
		return nil, fiber.ErrInternalServerError
	}

	totalHarvestRevenue := 0
	activeBagangs := make(map[string]bool)
	for _, h := range harvests {
		totalHarvestRevenue += int(float64(h.Price) * h.Weight)
		activeBagangs[h.BagangID] = true
	}
	activeBagangCount := len(activeBagangs)

	// Get total production costs (informational - subset of harvest payment)
	var costs []entity.ProductionCost
	if err := tx.Where("production_costs_season = ?", seasonID).Find(&costs).Error; err != nil {
		c.Log.WithError(err).Error("error fetching production costs for metrics")
		return nil, fiber.ErrInternalServerError
	}

	totalCosts := 0
	for _, cost := range costs {
		totalCosts += cost.Price
	}

	// Get season to filter sales by date range
	var season entity.Season
	if err := tx.Where("id = ?", seasonID).First(&season).Error; err != nil {
		c.Log.WithError(err).Error("error fetching season for metrics")
		return nil, fiber.ErrInternalServerError
	}

	// Get total sales revenue and total paid (from sales details and transactions)
	// Filter by season date range (issued_at between start_date and end_date)
	var salesList []entity.Sales
	salesQuery := tx.Preload("SalesDetails").Preload("TransactionDetails").
		Where("issued_at >= ?", season.StartDate)
	if season.EndDate != nil {
		salesQuery = salesQuery.Where("issued_at <= ?", *season.EndDate)
	}
	if err := salesQuery.Find(&salesList).Error; err != nil {
		c.Log.WithError(err).Error("error fetching sales for metrics")
		return nil, fiber.ErrInternalServerError
	}

	totalSalesRevenue := 0
	totalPaid := 0
	for _, sale := range salesList {
		for _, detail := range sale.SalesDetails {
			totalSalesRevenue += detail.Weight * detail.Price
		}
		for _, transaction := range sale.TransactionDetails {
			totalPaid += transaction.Amount
		}
	}

	// Calculate derived metrics
	accountsReceivable := totalSalesRevenue - totalPaid
	netProfit := totalSalesRevenue - totalHarvestRevenue

	// Calculate profit margin (avoid division by zero)
	var profitMargin float64
	if totalSalesRevenue > 0 {
		profitMargin = (float64(netProfit) / float64(totalSalesRevenue)) * 100
	}

	// Calculate average profit per bagang (avoid division by zero)
	var avgProfitPerBagang int
	if activeBagangCount > 0 {
		avgProfitPerBagang = netProfit / activeBagangCount
	}

	return &model.DashboardMetricsResponse{
		TotalHarvestRevenue:  totalHarvestRevenue,
		TotalCosts:           totalCosts,
		TotalSalesRevenue:    totalSalesRevenue,
		TotalPaid:            totalPaid,
		AccountsReceivable:   accountsReceivable,
		NetProfit:            netProfit,
		ProfitMargin:         profitMargin,
		AvgProfitPerBagang:   avgProfitPerBagang,
		ActiveBagangCount:    activeBagangCount,
	}, nil
}

// GetHarvestTrend returns monthly harvest revenue trend
func (c *DashboardUseCase) GetHarvestTrend(ctx context.Context, seasonID int) (*model.HarvestTrendResponse, error) {
	tx := c.DB.WithContext(ctx)

	var harvests []entity.Harvest
	if err := tx.Where("harvests_season = ?", seasonID).Order("harvest_date asc").Find(&harvests).Error; err != nil {
		c.Log.WithError(err).Error("error fetching harvests for trend")
		return nil, fiber.ErrInternalServerError
	}

	// Group by month
	monthlyData := make(map[string]int)
	monthOrder := []string{}

	for _, h := range harvests {
		monthKey := h.HarvestDate.Format("Jan 2006")
		if _, exists := monthlyData[monthKey]; !exists {
			monthOrder = append(monthOrder, monthKey)
		}
		monthlyData[monthKey] += int(float64(h.Price) * h.Weight)
	}

	data := make([]model.HarvestTrendItem, 0, len(monthOrder))
	for _, month := range monthOrder {
		data = append(data, model.HarvestTrendItem{
			Month:   month,
			Revenue: monthlyData[month],
		})
	}

	return &model.HarvestTrendResponse{Data: data}, nil
}

// GetHarvestByType returns harvest breakdown by type
func (c *DashboardUseCase) GetHarvestByType(ctx context.Context, seasonID int) (*model.HarvestByTypeResponse, error) {
	tx := c.DB.WithContext(ctx)

	var harvests []entity.Harvest
	if err := tx.Where("harvests_season = ?", seasonID).Find(&harvests).Error; err != nil {
		c.Log.WithError(err).Error("error fetching harvests by type")
		return nil, fiber.ErrInternalServerError
	}

	// Group by type
	typeData := make(map[string]int)
	for _, h := range harvests {
		typeData[h.HarvestType] += int(float64(h.Price) * h.Weight)
	}

	data := make([]model.HarvestByTypeItem, 0, len(typeData))
	for t, total := range typeData {
		data = append(data, model.HarvestByTypeItem{
			Type:  t,
			Total: total,
		})
	}

	// Sort by total descending
	sort.Slice(data, func(i, j int) bool {
		return data[i].Total > data[j].Total
	})

	return &model.HarvestByTypeResponse{Data: data}, nil
}

// GetBagangPerformance returns top bagangs by performance
func (c *DashboardUseCase) GetBagangPerformance(ctx context.Context, seasonID int, limit int) (*model.BagangPerformanceResponse, error) {
	tx := c.DB.WithContext(ctx)

	// Get all bagangs
	var bagangs []entity.Bagang
	if err := tx.Find(&bagangs).Error; err != nil {
		c.Log.WithError(err).Error("error fetching bagangs")
		return nil, fiber.ErrInternalServerError
	}

	bagangMap := make(map[string]entity.Bagang)
	for _, b := range bagangs {
		bagangMap[b.ID] = b
	}

	// Get harvests grouped by bagang
	var harvests []entity.Harvest
	if err := tx.Where("harvests_season = ?", seasonID).Find(&harvests).Error; err != nil {
		c.Log.WithError(err).Error("error fetching harvests for bagang performance")
		return nil, fiber.ErrInternalServerError
	}

	revenueByBagang := make(map[string]int)
	for _, h := range harvests {
		revenueByBagang[h.BagangID] += int(float64(h.Price) * h.Weight)
	}

	// Get costs grouped by bagang
	var costs []entity.ProductionCost
	if err := tx.Where("production_costs_season = ?", seasonID).Find(&costs).Error; err != nil {
		c.Log.WithError(err).Error("error fetching costs for bagang performance")
		return nil, fiber.ErrInternalServerError
	}

	costByBagang := make(map[string]int)
	for _, cost := range costs {
		costByBagang[cost.BagangID] += cost.Price
	}

	// Build performance data
	data := make([]model.BagangPerformanceItem, 0)
	for bagangID, revenue := range revenueByBagang {
		bagang, exists := bagangMap[bagangID]
		if !exists {
			continue
		}
		cost := costByBagang[bagangID]
		data = append(data, model.BagangPerformanceItem{
			BagangID:   bagangID,
			BagangName: bagang.Name,
			Revenue:    revenue,
			Cost:       cost,
			Profit:     revenue - cost,
		})
	}

	// Sort by profit descending
	sort.Slice(data, func(i, j int) bool {
		return data[i].Profit > data[j].Profit
	})

	// Limit results
	if limit > 0 && len(data) > limit {
		data = data[:limit]
	}

	return &model.BagangPerformanceResponse{Data: data}, nil
}

// GetRecentSales returns recent sales with payment status
func (c *DashboardUseCase) GetRecentSales(ctx context.Context, limit int) (*model.RecentSalesResponse, error) {
	tx := c.DB.WithContext(ctx)

	var salesList []entity.Sales
	query := tx.Preload("SalesDetails").Preload("TransactionDetails").Order("issued_at desc")
	if limit > 0 {
		query = query.Limit(limit)
	}
	if err := query.Find(&salesList).Error; err != nil {
		c.Log.WithError(err).Error("error fetching recent sales")
		return nil, fiber.ErrInternalServerError
	}

	data := make([]model.RecentSaleItem, len(salesList))
	for i, sale := range salesList {
		totalAmount := 0
		for _, detail := range sale.SalesDetails {
			totalAmount += detail.Weight * detail.Price
		}

		totalPaid := 0
		for _, tx := range sale.TransactionDetails {
			totalPaid += tx.Amount
		}

		data[i] = model.RecentSaleItem{
			ID:          sale.ID,
			Customer:    sale.Customer,
			IssuedAt:    sale.IssuedAt.Format("2006-01-02"),
			TotalAmount: totalAmount,
			TotalPaid:   totalPaid,
			IsPaidOff:   sale.IsPaidOff,
		}
	}

	return &model.RecentSalesResponse{Data: data}, nil
}
