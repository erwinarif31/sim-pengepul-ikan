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

func (c *PayrollUseCase) GeneratePayrollPDF(ctx context.Context, workerID string) ([]byte, string, error) {
	tx := c.DB.WithContext(ctx)

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
	if err := tx.Where("worker_id = ? OR owner_id = ?", workerID, workerID).Find(&bagangs).Error; err != nil {
		return nil, "", err
	}

	bagangIDs := make([]string, len(bagangs))
	bagangNames := make([]string, len(bagangs))
	for i, b := range bagangs {
		bagangIDs[i] = b.ID
		bagangNames[i] = b.Name
	}

	if len(bagangIDs) == 0 {
		return nil, "", fiber.NewError(fiber.StatusBadRequest, "No bagangs found for this person")
	}

	// 4. Calculate Harvest Revenue (Active Season, Associated Bagangs)
	var harvests []entity.Harvest
	if err := tx.Where("harvests_season = ? AND bagang_id IN ?", activeSeason.ID, bagangIDs).Find(&harvests).Error; err != nil {
		return nil, "", err
	}

	totalHarvestRevenue := 0
	for _, h := range harvests {
		totalHarvestRevenue += int(float64(h.Price) * h.Weight)
	}

	// 5. Calculate Shared Costs (Active Season, Associated Bagangs, CreatorRole="both")
	var sharedCosts []entity.ProductionCost
	if err := tx.Where("production_costs_season = ? AND bagang_id IN ? AND creator_role = 'both'", activeSeason.ID, bagangIDs).Find(&sharedCosts).Error; err != nil {
		return nil, "", err
	}

	totalSharedCost := 0
	for _, cost := range sharedCosts {
		totalSharedCost += cost.Price
	}

	// 6. Calculate Self Costs (Active Season, Associated Bagangs, CreatedBy=workerID)
	// Note: We scope to Bagangs to avoid mixing if they are involved in other unrelated Bagangs (though unlikely in this domain model, but safer)
	var selfCosts []entity.ProductionCost
	if err := tx.Where("production_costs_season = ? AND bagang_id IN ? AND created_by = ?", activeSeason.ID, bagangIDs, workerID).Find(&selfCosts).Error; err != nil {
		return nil, "", err
	}

	totalSelfCost := 0
	for _, cost := range selfCosts {
		totalSelfCost += cost.Price
	}

	// 7. Calculate Net
	netPayroll := totalHarvestRevenue - totalSharedCost - totalSelfCost

	// 8. Generate PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Laporan Penggajian")
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, fmt.Sprintf("Nama: %s", worker.Name))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Tanggal: %s", time.Now().Format("02 Jan 2006")))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Musim: %s", activeSeason.StartDate.Format("02 Jan 2006"))) // Start date of active season
	pdf.Ln(12)

	// Summary Table
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(100, 10, "Keterangan")
	pdf.Cell(50, 10, "Jumlah (Rp)")
	pdf.Ln(10)
	pdf.Line(10, pdf.GetY(), 200, pdf.GetY())

	pdf.SetFont("Arial", "", 12)
	
	// Harvest
	pdf.Cell(100, 10, "Total Hasil Panen")
	pdf.Cell(50, 10, fmt.Sprintf("%d", totalHarvestRevenue))
	pdf.Ln(10)

	// Shared Cost
	pdf.Cell(100, 10, "Pengeluaran Umum (Bersama)")
	pdf.Cell(50, 10, fmt.Sprintf("-%d", totalSharedCost))
	pdf.Ln(10)

	// Self Cost
	pdf.Cell(100, 10, "Pengeluaran Pribadi")
	pdf.Cell(50, 10, fmt.Sprintf("-%d", totalSelfCost))
	pdf.Ln(10)

	pdf.Line(10, pdf.GetY(), 200, pdf.GetY())
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(100, 10, "Total Bersih")
	pdf.Cell(50, 10, fmt.Sprintf("Rp %d", netPayroll))
	pdf.Ln(20)

	// Bagang List
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(40, 10, "Bagang Terkait:")
	pdf.Ln(8)
	pdf.SetFont("Arial", "", 12)
	for _, name := range bagangNames {
		pdf.Cell(40, 10, fmt.Sprintf("- %s", name))
		pdf.Ln(6)
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, "", err
	}

	filename := fmt.Sprintf("Payroll_%s_%s.pdf", worker.Name, time.Now().Format("20060102"))
	return buf.Bytes(), filename, nil
}
