package entity

type ProductionCostType struct {
	Name string `gorm:"column:name;primaryKey"`
}

func (ProductionCostType) TableName() string {
	return "production_costs_type"
}
