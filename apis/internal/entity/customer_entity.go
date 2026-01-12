package entity

import (
	"time"
)

type Customer struct {
	ID        string    `gorm:"primaryKey;column:id;type:uuid;default:gen_random_uuid()"`
	Name      string    `gorm:"column:name"`
	Contact   string    `gorm:"column:contact"`
	Address   string    `gorm:"column:address"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime"`
}

func (c *Customer) TableName() string {
	return "customers"
}
