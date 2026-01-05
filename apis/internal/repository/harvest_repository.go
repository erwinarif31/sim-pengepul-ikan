package repository

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type HarvestRepository struct {
	Repository[entity.Harvest]
	Log *logrus.Logger
}

func NewHarvestRepository(log *logrus.Logger) *HarvestRepository {
	return &HarvestRepository{Log: log}
}

func (r *HarvestRepository) FindByBagangId(db *gorm.DB, bagangId string) ([]entity.Harvest, error) {
	var harvests []entity.Harvest
	if err := db.Where("bagang_id = ?", bagangId).Find(&harvests).Error; err != nil {
		return nil, err
	}
	return harvests, nil
}
