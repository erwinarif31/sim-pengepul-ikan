package repository

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/sirupsen/logrus"
)

type TransactionDetailRepository struct {
	Repository[entity.TransactionDetail]
	Log *logrus.Logger
}

func NewTransactionDetailRepository(log *logrus.Logger) *TransactionDetailRepository {
	return &TransactionDetailRepository{Log: log}
}
