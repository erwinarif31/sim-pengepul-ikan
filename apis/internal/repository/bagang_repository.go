package repository

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/sirupsen/logrus"
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
