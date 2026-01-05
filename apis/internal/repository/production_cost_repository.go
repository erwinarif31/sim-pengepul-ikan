package repository

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ProductionCostRepository struct {
	Repository[entity.ProductionCost]
	Log *logrus.Logger
}

func NewProductionCostRepository(log *logrus.Logger) *ProductionCostRepository {
	return &ProductionCostRepository{Log: log}
}

func (r *ProductionCostRepository) FindByBagangId(db *gorm.DB, bagangId string) ([]entity.ProductionCost, error) {
	var costs []entity.ProductionCost
	if err := db.Where("bagang_id = ?", bagangId).Find(&costs).Error; err != nil {
		return nil, err
	}
	return costs, nil
}
