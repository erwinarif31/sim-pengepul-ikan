package main

import (
	"fmt"
	"log"
	"math"
	"math/rand"
	"time"

	"github.com/erwinarif31/catchery-api/internal/config"
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Indonesian names for customers
var indonesianNames = []string{
	"Andi", "Budi", "Citra", "Dewi", "Eko",
}

// Production cost types
var productionCostTypes = []string{"MINYAK", "BERAS", "GULA", "UTANG", "ES", "BBM"}

// Harvest types
var harvestTypes = []string{"Kecil", "Menengah", "Besar"}

// Creator roles for production costs
var creatorRoles = []string{"worker", "owner", "both"}

// Season config (single active season, started three months ago)
const seasonID = 1

var seasonEnd = startOfDay(time.Now()).AddDate(0, 0, 1) // exclusive upper bound
var seasonStart = seasonEnd.AddDate(0, -3, 0)

func main() {
	rand.Seed(42)

	// Initialize config
	viperConfig := config.NewViper()
	logger := config.NewLogger(viperConfig)
	db := config.NewDatabase(viperConfig, logger)

	log.Println("Starting Catchery Database Seeder...")

	// Seed in FK dependency order
	workerIDs, workerNames := seedWorkers(db, 8)
	log.Printf("Seeded %d workers\n", len(workerIDs))
	userCount := seedUsers(db, workerIDs)
	log.Printf("Seeded %d users\n", userCount)

	customerIDs := seedCustomers(db, 5)
	log.Printf("Seeded %d customers\n", len(customerIDs))

	bagangData := seedBagangs(db, workerIDs, workerNames)
	log.Printf("Seeded %d bagangs\n", len(bagangData))

	harvestCount := seedHarvests(db, bagangData)
	log.Printf("Seeded %d harvests\n", harvestCount)

	costCount := seedProductionCosts(db, bagangData)
	log.Printf("Seeded %d production costs\n", costCount)

	salesCount := seedSales(db, bagangData)
	log.Printf("Seeded %d sales with details and transactions\n", salesCount)

	log.Println("Seeding completed successfully!")
}

func seedUsers(db *gorm.DB, workerIDs []string) int {
	if len(workerIDs) < 5 {
		log.Println("Not enough workers to seed user accounts")
		return 0
	}

	accounts := []struct {
		id       string
		name     string
		password string
		role     string
		workerID *string
	}{
		{id: "admin", name: "Admin", password: "admin123", role: "ADMIN"},
		{id: "owner1", name: "Pemilik 1", password: "owner123", role: "OWNER", workerID: &workerIDs[0]},
		{id: "owner2", name: "Pemilik 2", password: "owner223", role: "OWNER", workerID: &workerIDs[3]},
		{id: "worker1", name: "Pekerja 1", password: "worker123", role: "WORKER", workerID: &workerIDs[2]},
		{id: "worker2", name: "Pekerja 2", password: "worker223", role: "WORKER", workerID: &workerIDs[4]},
	}

	count := 0
	for _, account := range accounts {
		password, err := bcrypt.GenerateFromPassword([]byte(account.password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Error hashing password for user %s: %v\n", account.id, err)
			continue
		}

		user := entity.User{
			ID:       account.id,
			Name:     account.name,
			Password: string(password),
			Role:     account.role,
			WorkerID: account.workerID,
		}
		if err := db.Create(&user).Error; err != nil {
			log.Printf("Error creating user %s: %v\n", account.id, err)
			continue
		}
		count++
	}

	return count
}

// seedWorkers creates workers with generic names: Person 1, Person 2, etc.
// Returns both IDs and Names for later use
func seedWorkers(db *gorm.DB, count int) ([]string, []string) {
	var ids []string
	var names []string

	for i := 1; i <= count; i++ {
		name := fmt.Sprintf("Person %d", i)
		worker := entity.Worker{
			ID:   uuid.New().String(),
			Name: name,
		}

		if err := db.Create(&worker).Error; err != nil {
			log.Printf("Error creating worker %d: %v\n", i, err)
			continue
		}
		ids = append(ids, worker.ID)
		names = append(names, name)
	}

	return ids, names
}

// seedCustomers creates customers with Indonesian names
func seedCustomers(db *gorm.DB, count int) []string {
	var ids []string

	for i := 0; i < count; i++ {
		name := indonesianNames[i%len(indonesianNames)]

		customer := entity.Customer{
			ID:      uuid.New().String(),
			Name:    name,
			Contact: fmt.Sprintf("08%d", 100000000+rand.Intn(900000000)),
			Address: fmt.Sprintf("Jl. Nelayan No. %d, Desa Pantai", i+1),
		}

		if err := db.Create(&customer).Error; err != nil {
			log.Printf("Error creating customer %s: %v\n", name, err)
			continue
		}
		ids = append(ids, customer.ID)
	}

	return ids
}

// BagangInfo holds bagang data needed for seeding related entities
type BagangInfo struct {
	ID         string
	WorkerID   string
	WorkerName string
	OwnerID    string
	OwnerName  string
	SamePerson bool // true if worker and owner are the same
}

// seedBagangs creates 5 bagangs with specific worker/owner combinations
// 2 bagangs (~40%) have same worker and owner
func seedBagangs(db *gorm.DB, workerIDs []string, workerNames []string) []BagangInfo {
	var bagangs []BagangInfo

	// Define explicit bagang configurations
	// Bagang 1 & 2: same person as worker and owner
	// Bagang 3, 4, 5: different worker and owner
	configs := []struct {
		workerIdx int
		ownerIdx  int
	}{
		{0, 0}, // Bagang 1: Person 1 is both worker and owner
		{1, 1}, // Bagang 2: Person 2 is both worker and owner
		{2, 3}, // Bagang 3: Person 3 (worker), Person 4 (owner)
		{4, 5}, // Bagang 4: Person 5 (worker), Person 6 (owner)
		{6, 7}, // Bagang 5: Person 7 (worker), Person 8 (owner)
	}

	for i, cfg := range configs {
		bagang := entity.Bagang{
			ID:       uuid.New().String(),
			Name:     fmt.Sprintf("Bagang %d", i+1),
			Isactive: true,
			WorkerID: workerIDs[cfg.workerIdx],
			OwnerID:  workerIDs[cfg.ownerIdx],
		}

		if err := db.Create(&bagang).Error; err != nil {
			log.Printf("Error creating bagang %d: %v\n", i+1, err)
			continue
		}

		bagangs = append(bagangs, BagangInfo{
			ID:         bagang.ID,
			WorkerID:   workerIDs[cfg.workerIdx],
			WorkerName: workerNames[cfg.workerIdx],
			OwnerID:    workerIDs[cfg.ownerIdx],
			OwnerName:  workerNames[cfg.ownerIdx],
			SamePerson: cfg.workerIdx == cfg.ownerIdx,
		})
	}

	return bagangs
}

// randomDateInSeason generates a random date within the active season
func randomDateInSeason() time.Time {
	diff := seasonEnd.Sub(seasonStart)
	randomDays := rand.Int63n(int64(diff.Hours() / 24))
	return seasonStart.AddDate(0, 0, int(randomDays))
}

// seedHarvests creates ~30 harvests (6 per bagang)
// IMPORTANT: created_by must be either worker_id or owner_id of the bagang
func seedHarvests(db *gorm.DB, bagangs []BagangInfo) int {
	count := 0
	harvestsPerBagang := 6

	for _, bagang := range bagangs {
		for i := 0; i < harvestsPerBagang; i++ {
			// Keep every fish type visible in each Bagang's presentation data.
			harvestType := harvestTypes[i%len(harvestTypes)]
			if i >= len(harvestTypes) {
				harvestType = harvestTypes[rand.Intn(len(harvestTypes))]
			}

			// Price based on harvest type
			var price int
			switch harvestType {
			case "Kecil":
				price = 15000 + rand.Intn(10000) // 15,000 - 25,000
			case "Menengah":
				price = 25000 + rand.Intn(15000) // 25,000 - 40,000
			case "Besar":
				price = 40000 + rand.Intn(20000) // 40,000 - 60,000
			}

			// CRITICAL: created_by must be either worker or owner of this bagang
			var creatorID string
			var creatorName string
			if rand.Float32() < 0.5 {
				creatorID = bagang.WorkerID
				creatorName = bagang.WorkerName
			} else {
				creatorID = bagang.OwnerID
				creatorName = bagang.OwnerName
			}

			harvest := entity.Harvest{
				ID:             uuid.New().String(),
				HarvestDate:    randomDateInSeason(),
				Weight:         float64(50+rand.Intn(450)) / 10, // 5.0 - 50.0 kg
				Price:          price,
				BagangID:       bagang.ID,
				HarvestType:    harvestType,
				CreatedBy:      &creatorID,
				CreatedByName:  &creatorName,
				HarvestsSeason: seasonID,
				Description:    fmt.Sprintf("Hasil tangkapan %s", harvestType),
			}

			if err := db.Create(&harvest).Error; err != nil {
				log.Printf("Error creating harvest: %v\n", err)
				continue
			}
			count++
		}
	}

	return count
}

// seedProductionCosts creates ~25 production costs (5 per bagang)
// IMPORTANT: created_by must match creator_role:
// - creator_role='worker' → created_by=bagang.worker_id
// - creator_role='owner' → created_by=bagang.owner_id
// - creator_role='both' → created_by=bagang.owner_id (cost is split 50/50)
func seedProductionCosts(db *gorm.DB, bagangs []BagangInfo) int {
	count := 0
	costsPerBagang := 5

	for _, bagang := range bagangs {
		for i := 0; i < costsPerBagang; i++ {
			costType := productionCostTypes[rand.Intn(len(productionCostTypes))]

			// Determine creator_role
			// If same person (worker=owner), 'both' doesn't make sense, so use 'worker' or 'owner'
			var creatorRole string
			if bagang.SamePerson {
				// When worker and owner are same person, randomly pick worker or owner
				if rand.Float32() < 0.5 {
					creatorRole = "worker"
				} else {
					creatorRole = "owner"
				}
			} else {
				// Different people - can use any role including 'both'
				creatorRole = creatorRoles[rand.Intn(len(creatorRoles))]
			}

			// Price based on cost type
			var price int
			switch costType {
			case "BBM", "MINYAK":
				price = 100000 + rand.Intn(400000) // 100,000 - 500,000
			case "BERAS":
				price = 200000 + rand.Intn(300000) // 200,000 - 500,000
			case "ES":
				price = 50000 + rand.Intn(150000) // 50,000 - 200,000
			case "GULA":
				price = 30000 + rand.Intn(70000) // 30,000 - 100,000
			case "UTANG":
				price = 500000 + rand.Intn(1500000) // 500,000 - 2,000,000
			default:
				price = 50000 + rand.Intn(200000)
			}

			// CRITICAL: Set created_by based on creator_role
			var creatorID string
			var creatorName string
			switch creatorRole {
			case "worker":
				creatorID = bagang.WorkerID
				creatorName = bagang.WorkerName
			case "owner", "both":
				creatorID = bagang.OwnerID
				creatorName = bagang.OwnerName
			}

			costDate := randomDateInSeason()

			cost := entity.ProductionCost{
				ID:                    uuid.New().String(),
				BagangID:              bagang.ID,
				ProductionCostType:    costType,
				Price:                 price,
				CreatedAt:             costDate,
				UpdatedAt:             costDate,
				CreatedBy:             &creatorID,
				CreatedByName:         &creatorName,
				ProductionCostsSeason: seasonID,
				CreatorRole:           creatorRole,
			}

			if err := db.Create(&cost).Error; err != nil {
				log.Printf("Error creating production cost: %v\n", err)
				continue
			}
			count++
		}
	}

	return count
}

// seedSales creates ~9 sales with details and transaction details
func seedSales(db *gorm.DB, bagangs []BagangInfo) int {
	count := 0
	totalSales := 9
	stock, err := loadSaleStock(db)
	if err != nil {
		log.Printf("Error loading stock for sales seed: %v\n", err)
		return 0
	}

	for i := 0; i < totalSales; i++ {
		// Random customer name from Indonesian names
		customerName := indonesianNames[rand.Intn(len(indonesianNames))]

		saleDate := randomDateInSeason()

		// ~50% paid off
		isPaidOff := rand.Float32() < 0.5
		var paidOffAt *time.Time

		if isPaidOff {
			paidDate := paymentDate(saleDate, rand.Intn(30)+1)
			paidOffAt = &paidDate
		}

		sale := entity.Sales{
			Customer:  customerName,
			IssuedAt:  saleDate,
			IsPaidOff: isPaidOff,
			PaidOffAt: paidOffAt,
		}

		if err := db.Create(&sale).Error; err != nil {
			log.Printf("Error creating sale: %v\n", err)
			continue
		}

		// Create 1-3 sales details per sale
		detailCount := 1 + rand.Intn(3)
		totalSaleAmount := 0
		createdDetails := 0

		for j := 0; j < detailCount; j++ {
			bagang := bagangs[(i+j)%len(bagangs)]
			bagangID := bagang.ID
			harvestType := harvestTypes[rand.Intn(len(harvestTypes))]
			if stock[bagangID][harvestType] < 1 {
				found := false
				for _, candidate := range bagangs {
					for _, candidateType := range harvestTypes {
						if stock[candidate.ID][candidateType] >= 1 {
							bagang = candidate
							bagangID = candidate.ID
							harvestType = candidateType
							found = true
							break
						}
					}
					if found {
						break
					}
				}
				if !found {
					break
				}
			}

			var price int
			switch harvestType {
			case "Kecil":
				price = 18000 + rand.Intn(7000) // Slightly higher than harvest price
			case "Menengah":
				price = 30000 + rand.Intn(15000)
			case "Besar":
				price = 50000 + rand.Intn(20000)
			}

			maxWeightTenths := int(stock[bagangID][harvestType] * 10)
			if maxWeightTenths > 900 {
				maxWeightTenths = 900
			}
			weight := float64(1+rand.Intn(maxWeightTenths)) / 10
			stock[bagangID][harvestType] -= float64(weight)

			detail := entity.SalesDetail{
				SalesID:     sale.ID,
				BagangID:    &bagangID,
				HarvestType: harvestType,
				Weight:      weight,
				Price:       price,
			}

			if err := db.Create(&detail).Error; err != nil {
				log.Printf("Error creating sales detail: %v\n", err)
				continue
			}

			totalSaleAmount += int(math.Round(weight * float64(price)))
			createdDetails++
		}
		if createdDetails == 0 {
			if err := db.Delete(&sale).Error; err != nil {
				log.Printf("Error removing empty sale %d: %v\n", sale.ID, err)
			}
			continue
		}

		// Create transaction details (payments)
		if isPaidOff {
			// Single full payment
			transaction := entity.TransactionDetail{
				SalesID: sale.ID,
				Amount:  totalSaleAmount,
				PaidAt:  *paidOffAt,
			}
			db.Create(&transaction)
		} else if rand.Float32() < 0.5 {
			// Partial payment (50% chance for unpaid sales)
			partialAmount := totalSaleAmount * (30 + rand.Intn(40)) / 100 // 30-70% payment
			paidDate := paymentDate(saleDate, rand.Intn(14)+1)

			transaction := entity.TransactionDetail{
				SalesID: sale.ID,
				Amount:  partialAmount,
				PaidAt:  paidDate,
			}
			db.Create(&transaction)
		}

		count++
	}

	return count
}

func startOfDay(value time.Time) time.Time {
	return time.Date(value.Year(), value.Month(), value.Day(), 0, 0, 0, 0, value.Location())
}

func paymentDate(saleDate time.Time, days int) time.Time {
	paidDate := saleDate.AddDate(0, 0, days)
	latestDate := seasonEnd.AddDate(0, 0, -1)
	if paidDate.After(latestDate) {
		return latestDate
	}
	return paidDate
}

func loadSaleStock(db *gorm.DB) (map[string]map[string]float64, error) {
	var harvests []entity.Harvest
	if err := db.Select("bagang_id, harvest_type, weight").Find(&harvests).Error; err != nil {
		return nil, err
	}

	stock := make(map[string]map[string]float64)
	for _, harvest := range harvests {
		if stock[harvest.BagangID] == nil {
			stock[harvest.BagangID] = make(map[string]float64)
		}
		stock[harvest.BagangID][harvest.HarvestType] += harvest.Weight
	}
	return stock, nil
}
