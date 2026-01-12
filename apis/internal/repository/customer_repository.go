package repository

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type CustomerRepository struct {
	Repository[entity.Customer]
	Log *logrus.Logger
}

func NewCustomerRepository(log *logrus.Logger) *CustomerRepository {
	return &CustomerRepository{
		Log: log,
	}
}

func (r *CustomerRepository) Search(db *gorm.DB, request *model.SearchCustomerRequest) ([]entity.Customer, error) {
	var customers []entity.Customer
	query := db.Model(&entity.Customer{})

	if request.Name != "" {
		query = query.Where("name ILIKE ?", "%"+request.Name+"%")
	}

	if err := query.Find(&customers).Error; err != nil {
		return nil, err
	}

	return customers, nil
}
