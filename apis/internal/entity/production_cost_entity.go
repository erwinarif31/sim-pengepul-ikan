package entity

import "time"

type ProductionCost struct {
	ID                    string    `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()"`
	BagangID              string    `gorm:"column:bagang_id"`
	ProductionCostType    string    `gorm:"column:production_costs_type"`
	Price                 int       `gorm:"column:price"`
	CreatedAt             time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP"`
	UpdatedAt             time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP"`
	CreatedBy             *string   `gorm:"column:created_by"`
	CreatedByName         *string   `gorm:"column:created_by_name"`
	ProductionCostsSeason int       `gorm:"column:production_costs_season"`
	CreatorRole           string    `gorm:"column:creator_role"`
}

func (ProductionCost) TableName() string {
	return "production_costs"
}
