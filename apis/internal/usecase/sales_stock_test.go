package usecase

import "testing"

func TestHasSufficientStock(t *testing.T) {
	tests := []struct {
		name      string
		stockIn   float64
		stockOut  float64
		requested float64
		want      bool
	}{
		{name: "enough stock", stockIn: 100.5, stockOut: 60, requested: 40.5, want: true},
		{name: "exact stock", stockIn: 100, stockOut: 60, requested: 40, want: true},
		{name: "insufficient stock", stockIn: 100, stockOut: 60, requested: 40.1, want: false},
		{name: "decimal remainder", stockIn: 60.5, stockOut: 60, requested: 0.6, want: false},
	}

	for _, testCase := range tests {
		t.Run(testCase.name, func(t *testing.T) {
			if got := hasSufficientStock(testCase.stockIn, testCase.stockOut, testCase.requested); got != testCase.want {
				t.Fatalf("hasSufficientStock() = %v, want %v", got, testCase.want)
			}
		})
	}
}

func TestValidateSalesDetailWeight(t *testing.T) {
	if err := validateSalesDetailWeight(1.234); err != nil {
		t.Fatalf("three-decimal weight rejected: %v", err)
	}
	if err := validateSalesDetailWeight(1.2345); err == nil {
		t.Fatal("weight with more than three decimals must be rejected")
	}
}
