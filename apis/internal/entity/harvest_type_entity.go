package entity

type HarvestType struct {
	Name string `gorm:"column:name;primaryKey"`
}

func (HarvestType) TableName() string {
	return "harvest_types"
}
