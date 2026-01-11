package model

import "time"

type SalesResponse struct {
	ID                 int                         `json:"id"`
	Customer           string                      `json:"customer"`
	IssuedAt           time.Time                   `json:"issued_at"`
	IsPaidOff          bool                        `json:"is_paid_off"`
	PaidOffAt          *time.Time                  `json:"paid_off_at,omitempty"`
	SalesDetails       []SalesDetailResponse       `json:"sales_details,omitempty"`
	TransactionDetails []TransactionDetailResponse `json:"transaction_details,omitempty"`
	TotalAmount        int                         `json:"total_amount"`
	TotalPaid          int                         `json:"total_paid"`
}

type SalesDetailResponse struct {
	ID          int    `json:"id"`
	SalesID     int    `json:"sales_id"`
	HarvestType string `json:"harvest_types"`
	Weight      int    `json:"weight"`
	Price       int    `json:"price"`
	Subtotal    int    `json:"subtotal"`
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
	HarvestType string `json:"harvest_type" validate:"required"`
	Weight      int    `json:"weight" validate:"required,min=1"`
	Price       int    `json:"price" validate:"required,min=0"`
}

type CreatePaymentRequest struct {
	Amount int `json:"amount" validate:"required,min=1"`
}
