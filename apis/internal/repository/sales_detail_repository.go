package repository

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/sirupsen/logrus"
)

type SalesDetailRepository struct {
	Repository[entity.SalesDetail]
	Log *logrus.Logger
}

func NewSalesDetailRepository(log *logrus.Logger) *SalesDetailRepository {
	return &SalesDetailRepository{Log: log}
}
