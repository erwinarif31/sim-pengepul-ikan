package model

import "time"

type SalesResponse struct {
	ID        int        `json:"id"`
	Customer  string     `json:"customer"`
	IssuedAt  time.Time  `json:"issued_at"`
	IsPaidOff bool       `json:"is_paid_off"`
	PaidOffAt *time.Time `json:"paid_off_at,omitempty"`
}

type CreateSalesRequest struct {
	Customer string `json:"customer" validate:"required"`
}
