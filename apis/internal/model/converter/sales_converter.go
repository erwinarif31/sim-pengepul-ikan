package converter

import (
	"math"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
)

func SalesToResponse(sales *entity.Sales) *model.SalesResponse {
	var totalAmount int
	salesDetails := make([]model.SalesDetailResponse, len(sales.SalesDetails))
	for i, detail := range sales.SalesDetails {
		subtotal := int(math.Round(detail.Weight * float64(detail.Price)))
		totalAmount += subtotal
		salesDetails[i] = model.SalesDetailResponse{
			ID:          detail.ID,
			SalesID:     detail.SalesID,
			BagangID:    detail.BagangID,
			BagangName:  bagangName(detail.Bagang),
			HarvestType: detail.HarvestType,
			Weight:      detail.Weight,
			Price:       detail.Price,
			Subtotal:    subtotal,
		}
	}

	var totalPaid int
	transactionDetails := make([]model.TransactionDetailResponse, len(sales.TransactionDetails))
	for i, transaction := range sales.TransactionDetails {
		totalPaid += transaction.Amount
		transactionDetails[i] = model.TransactionDetailResponse{
			ID:      transaction.ID,
			SalesID: transaction.SalesID,
			Amount:  transaction.Amount,
			PaidAt:  transaction.PaidAt,
		}
	}

	return &model.SalesResponse{
		ID:                 sales.ID,
		Customer:           sales.Customer,
		IssuedAt:           sales.IssuedAt,
		IsPaidOff:          sales.IsPaidOff,
		PaidOffAt:          sales.PaidOffAt,
		PaymentsVisible:    true,
		SalesDetails:       salesDetails,
		TransactionDetails: transactionDetails,
		TotalAmount:        totalAmount,
		TotalPaid:          totalPaid,
	}
}

func bagangName(bagang *entity.Bagang) string {
	if bagang == nil {
		return "Tanpa Bagang"
	}
	return bagang.Name
}
