package entity

import "time"

type Season struct {
	ID        int        `gorm:"column:id;primaryKey;autoIncrement"`
	StartDate time.Time  `gorm:"column:start_date"`
	EndDate   *time.Time `gorm:"column:end_date"`
}

func (Season) TableName() string {
	return "seasons"
}
