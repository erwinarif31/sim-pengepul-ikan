package converter

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
)

func CustomerToResponse(customer *entity.Customer) *model.CustomerResponse {
	return &model.CustomerResponse{
		ID:        customer.ID,
		Name:      customer.Name,
		Contact:   customer.Contact,
		Address:   customer.Address,
		CreatedAt: customer.CreatedAt,
		UpdatedAt: customer.UpdatedAt,
	}
}
