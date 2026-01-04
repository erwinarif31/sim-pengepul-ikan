package entity

type Worker struct {
	ID   string `gorm:"column:id;primaryKey"`
	Name string `gorm:"column:name"`
}

func (Worker) TableName() string {
	return "workers"
}
