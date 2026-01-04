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

func (r *SalesRepository) Search(db *gorm.DB) ([]entity.Sales, error) {
	var sales []entity.Sales
	if err := db.Find(&sales).Error; err != nil {
		return nil, err
	}
	return sales, nil
}