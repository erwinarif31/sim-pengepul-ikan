package repository

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type BagangRepository struct {
	Repository[entity.Bagang]
	Log *logrus.Logger
}

func NewBagangRepository(log *logrus.Logger) *BagangRepository {
	return &BagangRepository{
		Log: log,
	}
}

func (r *BagangRepository) Search(db *gorm.DB, request *model.SearchBagangRequest) ([]entity.Bagang, error) {
	var bagangs []entity.Bagang
	query := db.Model(&entity.Bagang{})

	if request.Name != "" {
		query = query.Where("name ILIKE ?", "%"+request.Name+"%")
	}
	if request.IsActive != nil {
		query = query.Where("isactive = ?", *request.IsActive)
	}

	if err := query.Find(&bagangs).Error; err != nil {
		return nil, err
	}
	return bagangs, nil
}
