package repository

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type SalesRepository struct {
	Repository[entity.Sales]
	Log *logrus.Logger
}

func NewSalesRepository(log *logrus.Logger) *SalesRepository {
	return &SalesRepository{
		Log: log,
	}
}

func (r *SalesRepository) Search(db *gorm.DB, request *model.SearchSalesRequest) ([]entity.Sales, error) {
	var sales []entity.Sales
	query := db.Model(&entity.Sales{})

	if request.Customer != "" {
		query = query.Where("customer ILIKE ?", "%"+request.Customer+"%")
	}
	if request.IsPaidOff != nil {
		query = query.Where("is_paid_off = ?", *request.IsPaidOff)
	}

	if err := query.Find(&sales).Error; err != nil {
		return nil, err
	}
	return sales, nil
}