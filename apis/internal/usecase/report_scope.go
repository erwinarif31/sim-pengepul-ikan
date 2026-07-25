package usecase

import (
	"math"
	"sort"
	"strings"
	"time"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type reportDateRange struct {
	start        time.Time
	endExclusive *time.Time
	empty        bool
}

type reportBagangScope struct {
	IDs      []string
	Names    map[string]string
	filtered bool
}

func resolveReportBagangScope(db *gorm.DB, auth *model.Auth, requestedBagangID string) (reportBagangScope, error) {
	if auth == nil {
		return reportBagangScope{}, fiber.ErrUnauthorized
	}

	query := db.Model(&entity.Bagang{})
	scope := reportBagangScope{Names: make(map[string]string)}

	switch auth.Role {
	case "ADMIN":
		if requestedBagangID != "" {
			query = query.Where("id = ?", requestedBagangID)
			scope.filtered = true
		}
	case "OWNER":
		if auth.WorkerID == nil {
			return reportBagangScope{}, fiber.ErrForbidden
		}
		query = query.Where("owner_id = ?", *auth.WorkerID)
		scope.filtered = true
		if requestedBagangID != "" {
			query = query.Where("id = ?", requestedBagangID)
		}
	case "WORKER":
		if auth.WorkerID == nil {
			return reportBagangScope{}, fiber.ErrForbidden
		}
		query = query.Where("worker_id = ?", *auth.WorkerID)
		scope.filtered = true
		if requestedBagangID != "" {
			query = query.Where("id = ?", requestedBagangID)
		}
	default:
		return reportBagangScope{}, fiber.ErrUnauthorized
	}

	var bagangs []entity.Bagang
	if err := query.Order("name asc").Find(&bagangs).Error; err != nil {
		return reportBagangScope{}, err
	}
	if requestedBagangID != "" && len(bagangs) == 0 {
		if auth.Role == "ADMIN" {
			return reportBagangScope{}, fiber.ErrNotFound
		}
		return reportBagangScope{}, fiber.ErrForbidden
	}

	scope.IDs = make([]string, 0, len(bagangs))
	for _, bagang := range bagangs {
		scope.IDs = append(scope.IDs, bagang.ID)
		scope.Names[bagang.ID] = bagang.Name
	}
	return scope, nil
}

func (s reportBagangScope) apply(query *gorm.DB, column string) *gorm.DB {
	if !s.filtered {
		return query
	}
	if len(s.IDs) == 0 {
		return query.Where("1 = 0")
	}
	return query.Where(column+" IN ?", s.IDs)
}

func applySalesDetailScope(query *gorm.DB, scope reportBagangScope) *gorm.DB {
	if !scope.filtered {
		return query
	}
	if len(scope.IDs) == 0 {
		return query.Where("1 = 0")
	}
	return query.Where(`EXISTS (
		SELECT 1 FROM sales_details scoped_sales_detail
		WHERE scoped_sales_detail.sales_id = sales.id
		AND scoped_sales_detail.bagang_id IN ?
	)`, scope.IDs)
}

func lockBagangRow(tx *gorm.DB, bagangID string) error {
	return tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", bagangID).Take(&entity.Bagang{}).Error
}

func lockBagangRows(tx *gorm.DB, bagangIDs ...string) error {
	uniqueIDs := make(map[string]struct{}, len(bagangIDs))
	for _, bagangID := range bagangIDs {
		if bagangID != "" {
			uniqueIDs[bagangID] = struct{}{}
		}
	}
	orderedIDs := make([]string, 0, len(uniqueIDs))
	for bagangID := range uniqueIDs {
		orderedIDs = append(orderedIDs, bagangID)
	}
	sort.Strings(orderedIDs)
	for _, bagangID := range orderedIDs {
		if err := lockBagangRow(tx, bagangID); err != nil {
			return err
		}
	}
	return nil
}

func preloadSalesDetails(query *gorm.DB, scope reportBagangScope) *gorm.DB {
	if scope.filtered {
		return query.Preload("SalesDetails", "bagang_id IN ?", scope.IDs).Preload("SalesDetails.Bagang")
	}
	return query.Preload("SalesDetails").Preload("SalesDetails.Bagang")
}

func (s reportBagangScope) name(bagangID string) string {
	if bagangID == "" {
		return "Tanpa Bagang"
	}
	if name := s.Names[bagangID]; name != "" {
		return name
	}
	return bagangID
}

func buildReportDateRange(season entity.Season, startDate, endDate string) (reportDateRange, error) {
	requestedStart, hasStart, err := parseReportDate(startDate)
	if err != nil {
		return reportDateRange{}, fiber.NewError(fiber.StatusBadRequest, "startDate must use YYYY-MM-DD")
	}
	requestedEnd, hasEnd, err := parseReportDate(endDate)
	if err != nil {
		return reportDateRange{}, fiber.NewError(fiber.StatusBadRequest, "endDate must use YYYY-MM-DD")
	}
	if hasStart && hasEnd && requestedStart.After(requestedEnd) {
		return reportDateRange{}, fiber.NewError(fiber.StatusBadRequest, "startDate must not be after endDate")
	}

	start := reportDateOnly(season.StartDate)
	if hasStart && requestedStart.After(start) {
		start = requestedStart
	}

	var endInclusive *time.Time
	if season.EndDate != nil {
		seasonEnd := reportDateOnly(*season.EndDate)
		endInclusive = &seasonEnd
	}
	if hasEnd && (endInclusive == nil || requestedEnd.Before(*endInclusive)) {
		endInclusive = &requestedEnd
	}

	dateRange := reportDateRange{start: start}
	if endInclusive != nil {
		endExclusive := endInclusive.AddDate(0, 0, 1)
		dateRange.endExclusive = &endExclusive
		dateRange.empty = !start.Before(endExclusive)
	}
	return dateRange, nil
}

func (r reportDateRange) apply(query *gorm.DB, column string) *gorm.DB {
	if r.empty {
		return query.Where("1 = 0")
	}
	query = query.Where(column+" >= ?", r.start)
	if r.endExclusive != nil {
		query = query.Where(column+" < ?", *r.endExclusive)
	}
	return query
}

func parseReportDate(value string) (time.Time, bool, error) {
	if strings.TrimSpace(value) == "" {
		return time.Time{}, false, nil
	}
	parsed, err := time.Parse("2006-01-02", value)
	return parsed, err == nil, err
}

func reportDateOnly(value time.Time) time.Time {
	return time.Date(value.Year(), value.Month(), value.Day(), 0, 0, 0, 0, time.UTC)
}

func normalizeFishType(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func detailInBagangScope(detail entity.SalesDetail, scope reportBagangScope) bool {
	if !scope.filtered {
		return true
	}
	if detail.BagangID == nil {
		return false
	}
	return bagangIDInScope(*detail.BagangID, scope)
}

func bagangIDInScope(bagangID string, scope reportBagangScope) bool {
	for _, scopedID := range scope.IDs {
		if bagangID == scopedID {
			return true
		}
	}
	return false
}

type saleBagangPaymentAllocation struct {
	bagangID  string
	paid      int
	remainder int64
}

func allocateSalePaidByBagang(sale entity.Sales) map[string]int {
	fullRevenue, totalPaid := calculateSaleTotals(sale)
	if fullRevenue <= 0 || totalPaid <= 0 {
		return map[string]int{}
	}

	revenueByBagang := make(map[string]int)
	for _, detail := range sale.SalesDetails {
		bagangID := ""
		if detail.BagangID != nil {
			bagangID = *detail.BagangID
		}
		revenueByBagang[bagangID] += calculateSaleDetailValue(detail.Weight, detail.Price)
	}

	allocations := make([]saleBagangPaymentAllocation, 0, len(revenueByBagang))
	allocated := 0
	for bagangID, revenue := range revenueByBagang {
		numerator := int64(totalPaid) * int64(revenue)
		paid := int(numerator / int64(fullRevenue))
		allocations = append(allocations, saleBagangPaymentAllocation{
			bagangID:  bagangID,
			paid:      paid,
			remainder: numerator % int64(fullRevenue),
		})
		allocated += paid
	}

	sort.Slice(allocations, func(i, j int) bool {
		if allocations[i].remainder == allocations[j].remainder {
			return allocations[i].bagangID < allocations[j].bagangID
		}
		return allocations[i].remainder > allocations[j].remainder
	})
	for i := 0; allocated < totalPaid; i++ {
		allocations[i%len(allocations)].paid++
		allocated++
	}

	result := make(map[string]int, len(allocations))
	for _, allocation := range allocations {
		result[allocation.bagangID] = allocation.paid
	}
	return result
}

func calculateSaleTotalsForScope(sale entity.Sales, scope reportBagangScope) (int, int) {
	if !scope.filtered {
		return calculateSaleTotals(sale)
	}

	fullRevenue, _ := calculateSaleTotals(sale)
	visibleRevenue := 0
	for _, detail := range sale.SalesDetails {
		if detailInBagangScope(detail, scope) {
			visibleRevenue += calculateSaleDetailValue(detail.Weight, detail.Price)
		}
	}
	if fullRevenue <= 0 {
		return visibleRevenue, 0
	}
	visiblePaid := 0
	for bagangID, paid := range allocateSalePaidByBagang(sale) {
		if bagangIDInScope(bagangID, scope) {
			visiblePaid += paid
		}
	}
	return visibleRevenue, visiblePaid
}

func salesBagangNames(sale entity.Sales, scope reportBagangScope) string {
	names := make(map[string]struct{})
	for _, detail := range sale.SalesDetails {
		if !detailInBagangScope(detail, scope) {
			continue
		}
		if detail.Bagang == nil {
			names["Tanpa Bagang"] = struct{}{}
			continue
		}
		names[detail.Bagang.Name] = struct{}{}
	}
	if len(names) == 0 {
		return "Tanpa Bagang"
	}
	result := make([]string, 0, len(names))
	for name := range names {
		result = append(result, name)
	}
	sort.Strings(result)
	return strings.Join(result, ", ")
}

func nonNegative(value int) int {
	if value < 0 {
		return 0
	}
	return value
}

func calculateNetProfit(revenue, productionCost int) int {
	return revenue - productionCost
}

func calculateHarvestValue(price int, weight float64) int {
	return int(math.Round(float64(price) * weight))
}

func calculateSaleDetailValue(weight float64, price int) int {
	return int(math.Round(weight * float64(price)))
}

func calculateProfitMargin(revenue, netProfit int) float64 {
	if revenue <= 0 {
		return 0
	}
	return float64(netProfit) / float64(revenue) * 100
}

func calculateSaleReceivable(revenue, paid int) int {
	return nonNegative(revenue - paid)
}

func calculateSalesTotals(sales []entity.Sales) (int, int, int) {
	return calculateSalesTotalsForScope(sales, reportBagangScope{})
}

func calculateSalesTotalsForScope(sales []entity.Sales, scope reportBagangScope) (int, int, int) {
	totalRevenue := 0
	totalPaid := 0
	totalReceivable := 0
	for _, sale := range sales {
		revenue, paid := calculateSaleTotalsForScope(sale, scope)
		totalRevenue += revenue
		totalPaid += paid
		totalReceivable += calculateSaleReceivable(revenue, paid)
	}
	return totalRevenue, totalPaid, totalReceivable
}

func financialReportRoleAllowed(auth *model.Auth) error {
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
