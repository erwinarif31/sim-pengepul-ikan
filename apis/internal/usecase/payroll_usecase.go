package usecase

import (
	"bytes"
	"context"
	"fmt"
	"time"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type PayrollUseCase struct {
	DB                       *gorm.DB
	Log                      *logrus.Logger
	HarvestRepository        *repository.HarvestRepository
	ProductionCostRepository *repository.ProductionCostRepository
	BagangRepository         *repository.BagangRepository
	WorkerRepository         *repository.WorkerRepository
	SeasonRepository         *repository.SeasonRepository
}

func NewPayrollUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	harvestRepo *repository.HarvestRepository,
	prodCostRepo *repository.ProductionCostRepository,
	bagangRepo *repository.BagangRepository,
	workerRepo *repository.WorkerRepository,
	seasonRepo *repository.SeasonRepository,
) *PayrollUseCase {
	return &PayrollUseCase{
		DB:                       db,
		Log:                      log,
		HarvestRepository:        harvestRepo,
		ProductionCostRepository: prodCostRepo,
		BagangRepository:         bagangRepo,
		WorkerRepository:         workerRepo,
		SeasonRepository:         seasonRepo,
	}
}

func (c *PayrollUseCase) GeneratePayrollPDF(ctx context.Context, auth *model.Auth, workerID string, bagangID string) ([]byte, string, error) {
	tx := c.DB.WithContext(ctx)
	if auth == nil {
		return nil, "", fiber.ErrUnauthorized
	}
	if auth.Role == "WORKER" {
		if auth.WorkerID == nil || *auth.WorkerID != workerID {
			return nil, "", fiber.ErrForbidden
		}
	}
	if auth.Role != "ADMIN" && auth.Role != "OWNER" && auth.Role != "WORKER" {
		return nil, "", fiber.ErrUnauthorized
	}

	// 1. Get Worker Info
	worker := new(entity.Worker)
	if err := c.WorkerRepository.FindById(tx, worker, workerID); err != nil {
		return nil, "", fiber.ErrNotFound
	}

	// 2. Get Active Season
	var activeSeason entity.Season
	if err := tx.Where("end_date IS NULL").First(&activeSeason).Error; err != nil {
		return nil, "", fiber.NewError(fiber.StatusBadRequest, "No active season found")
	}

	// 3. Get Associated Bagangs
	var bagangs []entity.Bagang
	bagangQuery := tx.Where("worker_id = ? OR owner_id = ?", workerID, workerID)
	if auth.Role == "OWNER" {
		if auth.WorkerID == nil {
			return nil, "", fiber.ErrForbidden
		}
		bagangQuery = tx.Where("owner_id = ? AND (worker_id = ? OR owner_id = ?)", *auth.WorkerID, workerID, workerID)
	}
	if bagangID != "" {
		bagangQuery = bagangQuery.Where("id = ?", bagangID)
	}
	if err := bagangQuery.Find(&bagangs).Error; err != nil {
		return nil, "", err
	}

	foundBagangIDs := make([]string, len(bagangs))
	bagangNamesMap := make(map[string]string)
	for i, b := range bagangs {
		foundBagangIDs[i] = b.ID
		bagangNamesMap[b.ID] = b.Name
	}

	if len(foundBagangIDs) == 0 {
		return nil, "", fiber.NewError(fiber.StatusBadRequest, "No bagangs found for this selection")
	}

	// 4. Calculate Harvest Revenue
	var harvests []entity.Harvest
	if err := tx.Where("harvests_season = ? AND bagang_id IN ?", activeSeason.ID, foundBagangIDs).Order("harvest_date asc").Find(&harvests).Error; err != nil {
		return nil, "", err
	}

	totalHarvestRevenue := 0
	for _, h := range harvests {
		totalHarvestRevenue += int(float64(h.Price) * h.Weight)
	}

	// 5. Calculate Shared Costs (Divided between worker and owner if they are different)
	var sharedCosts []entity.ProductionCost
	if err := tx.Where("production_costs_season = ? AND bagang_id IN ? AND creator_role = 'both'", activeSeason.ID, foundBagangIDs).Order("created_at asc").Find(&sharedCosts).Error; err != nil {
		return nil, "", err
	}

	// Map bagangs for quick lookup
	bagangMap := make(map[string]entity.Bagang)
	for _, b := range bagangs {
		bagangMap[b.ID] = b
	}

	totalSharedCostBurden := 0
	type sharedCostDisplay struct {
		cost   entity.ProductionCost
		burden int
	}
	sharedCostDisplays := make([]sharedCostDisplay, len(sharedCosts))

	for i, cost := range sharedCosts {
		burden := cost.Price
		b, exists := bagangMap[cost.BagangID]
		if exists && b.WorkerID != b.OwnerID {
			// Divide by 2 if worker and owner are different
			burden = cost.Price / 2
		}
		totalSharedCostBurden += burden
		sharedCostDisplays[i] = sharedCostDisplay{cost: cost, burden: burden}
	}

	// 6. Calculate Self Costs
	var selfCosts []entity.ProductionCost
	if err := tx.Where("production_costs_season = ? AND bagang_id IN ? AND created_by = ? AND creator_role <> 'both'", activeSeason.ID, foundBagangIDs, workerID).Order("created_at asc").Find(&selfCosts).Error; err != nil {
		return nil, "", err
	}

	totalSelfCost := 0
	for _, cost := range selfCosts {
		totalSelfCost += cost.Price
	}

	// 7. Calculate Net
	netPayroll := totalHarvestRevenue - totalSharedCostBurden - totalSelfCost

	// 8. Generate PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetFont("Arial", "B", 16)
	pdf.AddPage()
	pdf.Cell(40, 10, "Laporan Penggajian")
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, fmt.Sprintf("Nama: %s", worker.Name))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Tanggal Cetak: %s", time.Now().Format("02 Jan 2006 15:04")))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Musim: %s", activeSeason.StartDate.Format("02 Jan 2006")))
	if bagangID != "" && len(bagangs) > 0 {
		pdf.Ln(8)
		pdf.Cell(40, 10, fmt.Sprintf("Bagang: %s", bagangs[0].Name))
	}
	pdf.Ln(12)

	// --- 1. Detail Hasil Panen ---
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(40, 10, "Detail Hasil Panen:")
	pdf.Ln(8)
	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(30, 8, "Tanggal")
	pdf.Cell(45, 8, "Jenis")
	pdf.Cell(25, 8, "Berat (kg)")
	pdf.Cell(35, 8, "Harga (Rp)")
	pdf.Cell(40, 8, "Subtotal (Rp)")
	pdf.Ln(8)
	pdf.Line(10, pdf.GetY(), 200, pdf.GetY())
	pdf.SetFont("Arial", "", 10)

	for _, h := range harvests {
		subtotal := int(float64(h.Price) * h.Weight)
		pdf.Cell(30, 8, h.HarvestDate.Format("02/01/2006"))
		pdf.Cell(45, 8, h.HarvestType)
		pdf.Cell(25, 8, fmt.Sprintf("%.2f", h.Weight))
		pdf.Cell(35, 8, fmt.Sprintf("%d", h.Price))
		pdf.Cell(40, 8, fmt.Sprintf("%d", subtotal))
		pdf.Ln(6)
	}
	pdf.Ln(4)
	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(135, 8, "Total Pendapatan Panen")
	pdf.Cell(40, 8, fmt.Sprintf("Rp %d", totalHarvestRevenue))
	pdf.Ln(12)

	// --- 2. Detail Pengeluaran Bersama (Shared) ---
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(40, 10, "Detail Pengeluaran Bersama: ")
	pdf.Ln(8)
	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(25, 8, "Tanggal")
	pdf.Cell(55, 8, "Jenis")
	pdf.Cell(35, 8, "Bagang")
	pdf.Cell(30, 8, "Total (Rp)")
	pdf.Cell(35, 8, "Beban (Rp)")
	pdf.Ln(8)
	pdf.Line(10, pdf.GetY(), 200, pdf.GetY())
	pdf.SetFont("Arial", "", 10)

	for _, scd := range sharedCostDisplays {
		pdf.Cell(25, 8, scd.cost.CreatedAt.Format("02/01/2006"))
		pdf.Cell(55, 8, scd.cost.ProductionCostType)
		pdf.Cell(35, 8, bagangNamesMap[scd.cost.BagangID])
		pdf.Cell(30, 8, fmt.Sprintf("%d", scd.cost.Price))
		pdf.Cell(35, 8, fmt.Sprintf("%d", scd.burden))
		pdf.Ln(6)
	}
	pdf.Ln(4)
	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(145, 8, "Total Beban Pengeluaran Bersama")
	pdf.Cell(35, 8, fmt.Sprintf("Rp %d", totalSharedCostBurden))
	pdf.Ln(12)

	// --- 3. Detail Pengeluaran Pribadi ---
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(40, 10, "Detail Pengeluaran Pribadi:")
	pdf.Ln(8)
	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(30, 8, "Tanggal")
	pdf.Cell(60, 8, "Jenis")
	pdf.Cell(50, 8, "Bagang")
	pdf.Cell(40, 8, "Jumlah (Rp)")
	pdf.Ln(8)
	pdf.Line(10, pdf.GetY(), 200, pdf.GetY())
	pdf.SetFont("Arial", "", 10)

	for _, cost := range selfCosts {
		pdf.Cell(30, 8, cost.CreatedAt.Format("02/01/2006"))
		pdf.Cell(60, 8, cost.ProductionCostType)
		pdf.Cell(50, 8, bagangNamesMap[cost.BagangID])
		pdf.Cell(40, 8, fmt.Sprintf("%d", cost.Price))
		pdf.Ln(6)
	}
	pdf.Ln(4)
	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(140, 8, "Total Pengeluaran Pribadi")
	pdf.Cell(40, 8, fmt.Sprintf("Rp %d", totalSelfCost))
	pdf.Ln(15)

	// --- Final Summary ---
	pdf.SetFont("Arial", "B", 14)
	pdf.Line(10, pdf.GetY(), 200, pdf.GetY())
	pdf.Cell(140, 12, "TOTAL BERSIH (NET)")
	pdf.Cell(40, 12, fmt.Sprintf("Rp %d", netPayroll))
	pdf.Ln(20)

	if pdf.Error() != nil {
		c.Log.WithError(pdf.Error()).Error("error generating PDF content")
		return nil, "", pdf.Error()
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		c.Log.WithError(err).Error("error outputting PDF buffer")
		return nil, "", err
	}

	filename := fmt.Sprintf("Payroll_%s_%s.pdf", worker.Name, time.Now().Format("20060102"))
	return buf.Bytes(), filename, nil
}
