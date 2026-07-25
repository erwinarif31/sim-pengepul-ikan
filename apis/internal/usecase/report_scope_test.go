package usecase

import (
	"strings"
	"testing"
	"time"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestNormalizeFishType(t *testing.T) {
	tests := map[string]string{
		" Tuna ":    "tuna",
		"TUNA":      "tuna",
		" tongkol ": "tongkol",
	}
	for input, expected := range tests {
		if actual := normalizeFishType(input); actual != expected {
			t.Fatalf("normalizeFishType(%q) = %q, want %q", input, actual, expected)
		}
	}
}

func TestBuildReportDateRangeUsesInclusiveEndDate(t *testing.T) {
	seasonEnd := time.Date(2026, 7, 31, 0, 0, 0, 0, time.UTC)
	rangeValue, err := buildReportDateRange(entity.Season{
		StartDate: time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC),
		EndDate:   &seasonEnd,
	}, "2026-07-10", "2026-07-20")
	if err != nil {
		t.Fatal(err)
	}
	if !rangeValue.start.Equal(time.Date(2026, 7, 10, 0, 0, 0, 0, time.UTC)) {
		t.Fatalf("start = %v, want 2026-07-10", rangeValue.start)
	}
	if rangeValue.endExclusive == nil || !rangeValue.endExclusive.Equal(time.Date(2026, 7, 21, 0, 0, 0, 0, time.UTC)) {
		t.Fatalf("endExclusive = %v, want 2026-07-21", rangeValue.endExclusive)
	}
}

func TestBuildReportDateRangeIntersectsSeason(t *testing.T) {
	seasonEnd := time.Date(2026, 7, 31, 0, 0, 0, 0, time.UTC)
	rangeValue, err := buildReportDateRange(entity.Season{
		StartDate: time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC),
		EndDate:   &seasonEnd,
	}, "2026-08-01", "2026-08-02")
	if err != nil {
		t.Fatal(err)
	}
	if !rangeValue.empty {
		t.Fatal("expected date range outside season to be empty")
	}
}

func TestBuildReportDateRangeRejectsReversedDates(t *testing.T) {
	_, err := buildReportDateRange(entity.Season{
		StartDate: time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC),
	}, "2026-07-20", "2026-07-10")
	if err == nil {
		t.Fatal("expected reversed dates to fail")
	}
}

func TestStockSummaryRowsPreserveDecimalWeightAndNegativeBalance(t *testing.T) {
	bagangID := "bagang-1"
	rows := stockSummaryRows(map[stockKey]stockValue{
		{bagangID: bagangID, harvestType: "tuna"}: {stockIn: 100.5, stockOut: 60},
		{bagangID: "", harvestType: "tongkol"}:    {stockIn: 0, stockOut: 12},
	}, reportBagangScope{Names: map[string]string{bagangID: "Bagang A"}})
	if len(rows) != 2 {
		t.Fatalf("got %d rows, want 2", len(rows))
	}
	for _, row := range rows {
		if row.HarvestType == "tuna" {
			if row.StockInKG != 100.5 || row.StockBalanceKG != 40.5 || row.IsNegative {
				t.Fatalf("unexpected tuna row: %+v", row)
			}
		}
		if row.HarvestType == "tongkol" {
			if row.BagangID != nil || row.BagangName != "Tanpa Bagang" || !row.IsNegative || row.StockBalanceKG != -12 {
				t.Fatalf("unexpected unassigned row: %+v", row)
			}
		}
	}
}

func TestFinancialCalculations(t *testing.T) {
	sale := entity.Sales{
		SalesDetails:       []entity.SalesDetail{{Weight: 2, Price: 100}, {Weight: 3, Price: 50}},
		TransactionDetails: []entity.TransactionDetail{{Amount: 250}, {Amount: 100}},
	}
	revenue, paid := calculateSaleTotals(sale)
	if revenue != 350 || paid != 350 {
		t.Fatalf("sale totals = (%d, %d), want (350, 350)", revenue, paid)
	}
	if nonNegative(350-400) != 0 {
		t.Fatal("receivable must not be negative")
	}
	if calculateSaleReceivable(100, 150) != 0 {
		t.Fatal("overpaid sale must not create receivable")
	}
	sales := []entity.Sales{
		{SalesDetails: []entity.SalesDetail{{Weight: 1, Price: 100}}, TransactionDetails: []entity.TransactionDetail{{Amount: 150}}},
		{SalesDetails: []entity.SalesDetail{{Weight: 3, Price: 100}}, TransactionDetails: []entity.TransactionDetail{{Amount: 100}}},
	}
	totalRevenue, totalPaid, totalReceivable := calculateSalesTotals(sales)
	if totalRevenue != 400 || totalPaid != 250 || totalReceivable != 200 {
		t.Fatalf("sales totals = (%d, %d, %d), want (400, 250, 200)", totalRevenue, totalPaid, totalReceivable)
	}
	if calculateNetProfit(1000, 250) != 750 {
		t.Fatal("net profit must subtract production cost")
	}
	if calculateProfitMargin(0, 100) != 0 {
		t.Fatal("zero revenue margin must be zero")
	}
	if calculateHarvestValue(100, 1.236) != 124 {
		t.Fatalf("harvest value = %d, want 124", calculateHarvestValue(100, 1.236))
	}
	if calculateSaleDetailValue(1.234, 1000) != 1234 {
		t.Fatalf("sale detail value = %d, want 1234", calculateSaleDetailValue(1.234, 1000))
	}
}

func TestSaleTotalsAllocateSharedSaleByBagang(t *testing.T) {
	sale := entity.Sales{
		SalesDetails: []entity.SalesDetail{
			{BagangID: stringPtrForTest("bagang-1"), Weight: 1, Price: 100},
			{BagangID: stringPtrForTest("bagang-2"), Weight: 3, Price: 100},
		},
		TransactionDetails: []entity.TransactionDetail{{Amount: 200}},
	}
	scope := reportBagangScope{IDs: []string{"bagang-1"}, filtered: true}
	revenue, paid := calculateSaleTotalsForScope(sale, scope)
	if revenue != 100 || paid != 50 {
		t.Fatalf("scoped sale totals = (%d, %d), want (100, 50)", revenue, paid)
	}

	roundingSale := entity.Sales{
		SalesDetails: []entity.SalesDetail{
			{BagangID: stringPtrForTest("bagang-1"), Weight: 1, Price: 100},
			{BagangID: stringPtrForTest("bagang-2"), Weight: 1, Price: 100},
		},
		TransactionDetails: []entity.TransactionDetail{{Amount: 1}},
	}
	firstScope := reportBagangScope{IDs: []string{"bagang-1"}, filtered: true}
	secondScope := reportBagangScope{IDs: []string{"bagang-2"}, filtered: true}
	_, firstPaid := calculateSaleTotalsForScope(roundingSale, firstScope)
	_, secondPaid := calculateSaleTotalsForScope(roundingSale, secondScope)
	if firstPaid+secondPaid != 1 || firstPaid != 1 || secondPaid != 0 {
		t.Fatalf("rounded scoped payments = (%d, %d), want (1, 0)", firstPaid, secondPaid)
	}
}

func TestBagangScopeByRole(t *testing.T) {
	bagang := &entity.Bagang{WorkerID: "worker-1", OwnerID: "owner-1"}
	cases := []struct {
		name string
		auth *model.Auth
		want bool
	}{
		{name: "admin", auth: &model.Auth{Role: "ADMIN"}, want: true},
		{name: "owner in scope", auth: &model.Auth{Role: "OWNER", WorkerID: stringPtrForTest("owner-1")}, want: true},
		{name: "owner out of scope", auth: &model.Auth{Role: "OWNER", WorkerID: stringPtrForTest("owner-2")}, want: false},
		{name: "worker in scope", auth: &model.Auth{Role: "WORKER", WorkerID: stringPtrForTest("worker-1")}, want: true},
		{name: "worker out of scope", auth: &model.Auth{Role: "WORKER", WorkerID: stringPtrForTest("worker-2")}, want: false},
	}
	for _, testCase := range cases {
		t.Run(testCase.name, func(t *testing.T) {
			if actual := bagangInScope(testCase.auth, bagang); actual != testCase.want {
				t.Fatalf("bagangInScope() = %v, want %v", actual, testCase.want)
			}
		})
	}
}

func TestSalesDetailScopeApplyAddsEmptyGuardAndIDs(t *testing.T) {
	db, err := gorm.Open(postgres.New(postgres.Config{DSN: "host=unused"}), &gorm.Config{
		DryRun:               true,
		DisableAutomaticPing: true,
	})
	if err != nil {
		t.Fatal(err)
	}

	filtered := reportBagangScope{IDs: []string{"bagang-1", "bagang-2"}, filtered: true}
	statement := applySalesDetailScope(db.Model(&entity.Sales{}), filtered).Find(&[]entity.Sales{}).Statement
	if !strings.Contains(statement.SQL.String(), `scoped_sales_detail.bagang_id IN ($1,$2)`) {
		t.Fatalf("scope SQL = %q, want source bagang filter", statement.SQL.String())
	}

	empty := reportBagangScope{filtered: true}
	emptyStatement := applySalesDetailScope(db.Model(&entity.Sales{}), empty).Find(&[]entity.Sales{}).Statement
	if !strings.Contains(emptyStatement.SQL.String(), "1 = 0") {
		t.Fatalf("empty scope SQL = %q, want empty guard", emptyStatement.SQL.String())
	}
}

func stringPtrForTest(value string) *string {
	return &value
}
