package model

import "time"

type CustomerResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Contact   string    `json:"contact"`
	Address   string    `json:"address"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateCustomerRequest struct {
	Name    string `json:"name" validate:"required,max=255"`
	Contact string `json:"contact" validate:"max=255"`
	Address string `json:"address"`
}

type UpdateCustomerRequest struct {
	Name    string `json:"name" validate:"required,max=255"`
	Contact string `json:"contact" validate:"max=255"`
	Address string `json:"address"`
}

type SearchCustomerRequest struct {
	Name string `query:"name"`
}
