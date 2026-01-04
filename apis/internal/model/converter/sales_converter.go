package converter

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
)

func SalesToResponse(sales *entity.Sales) *model.SalesResponse {
	return &model.SalesResponse{
		ID:        sales.ID,
		Customer:  sales.Customer,
		IssuedAt:  sales.IssuedAt,
		IsPaidOff: sales.IsPaidOff,
		PaidOffAt: sales.PaidOffAt,
	}
}
