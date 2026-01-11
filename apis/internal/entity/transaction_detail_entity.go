package entity

import "time"

type TransactionDetail struct {
	ID      int       `gorm:"column:id;primaryKey;autoIncrement"`
	SalesID int       `gorm:"column:sales_id"`
	Amount  int       `gorm:"column:amount"`
	PaidAt  time.Time `gorm:"column:paid_at;default:CURRENT_TIMESTAMP"`
}

func (TransactionDetail) TableName() string {
	return "transaction_details"
}
