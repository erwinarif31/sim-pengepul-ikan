package model

import "time"

type SalesResponse struct {
	ID                 int                         `json:"id"`
	Customer           string                      `json:"customer"`
	IssuedAt           time.Time                   `json:"issued_at"`
	IsPaidOff          bool                        `json:"is_paid_off"`
	PaidOffAt          *time.Time                  `json:"paid_off_at,omitempty"`
	PaymentsVisible    bool                        `json:"payments_visible"`
	SalesDetails       []SalesDetailResponse       `json:"sales_details,omitempty"`
	TransactionDetails []TransactionDetailResponse `json:"transaction_details,omitempty"`
	TotalAmount        int                         `json:"total_amount"`
	TotalPaid          int                         `json:"total_paid"`
}

type SalesDetailResponse struct {
	ID          int     `json:"id"`
	SalesID     int     `json:"sales_id"`
	BagangID    *string `json:"bagang_id"`
	BagangName  string  `json:"bagang_name"`
	HarvestType string  `json:"harvest_types"`
	Weight      float64 `json:"weight"`
	Price       int     `json:"price"`
	Subtotal    int     `json:"subtotal"`
}

type TransactionDetailResponse struct {
	ID      int       `json:"id"`
	SalesID int       `json:"sales_id"`
	Amount  int       `json:"amount"`
	PaidAt  time.Time `json:"paid_at"`
}

type CreateSalesRequest struct {
	Customer string `json:"customer" validate:"required"`
}

type CreateSalesItemRequest struct {
	HarvestType string  `json:"harvest_type" validate:"required"`
	Weight      float64 `json:"weight" validate:"required,gt=0"`
	Price       int     `json:"price" validate:"required,min=0"`
	BagangID    string  `json:"bagang_id" validate:"required,uuid"`
}

type CreatePaymentRequest struct {
	Amount int `json:"amount" validate:"required,min=1"`
}

type SearchSalesRequest struct {
	Customer  string `query:"customer"`
	IsPaidOff *bool  `query:"is_paid_off"`
}
