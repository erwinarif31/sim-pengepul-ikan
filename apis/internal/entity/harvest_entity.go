package entity

import "time"

type Harvest struct {
	ID             string    `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()"`
	HarvestDate    time.Time `gorm:"column:harvest_date"`
	Weight         float64   `gorm:"column:weight"`
	Price          int       `gorm:"column:price"`
	BagangID       string    `gorm:"column:bagang_id"`
	HarvestType    string    `gorm:"column:harvest_type"`
	CreatedBy      *string   `gorm:"column:created_by"`
	CreatedByName  *string   `gorm:"column:created_by_name"`
	HarvestsSeason int       `gorm:"column:harvests_season"`
	Description    string    `gorm:"column:description"`
}

func (Harvest) TableName() string {
	return "harvests"
}
