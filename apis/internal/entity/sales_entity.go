package entity

import "time"

type Sales struct {
	ID        int        `gorm:"column:id;primaryKey;autoIncrement"`
	Customer  string     `gorm:"column:customer"`
	BagangID  *string    `gorm:"column:bagang_id"`
	IssuedAt  time.Time  `gorm:"column:issued_at;autoCreateTime"`
	IsPaidOff bool       `gorm:"column:is_paid_off"`
	PaidOffAt *time.Time `gorm:"column:paid_off_at"`

	SalesDetails       []SalesDetail       `gorm:"foreignKey:SalesID;references:ID"`
	TransactionDetails []TransactionDetail `gorm:"foreignKey:SalesID;references:ID"`
	Bagang             *Bagang             `gorm:"foreignKey:BagangID;references:ID"`
}

type SalesDetail struct {
	ID          int    `gorm:"column:id;primaryKey;autoIncrement"`
	SalesID     int    `gorm:"column:sales_id"`
	HarvestType string `gorm:"column:harvest_types"`
	Weight      int    `gorm:"column:weight"`
	Price       int    `gorm:"column:price"`
}

func (Sales) TableName() string {
	return "sales"
}

func (SalesDetail) TableName() string {
	return "sales_details"
}
