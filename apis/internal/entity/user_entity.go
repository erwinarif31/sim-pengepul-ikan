package entity

// User is a struct that represents a user entity
type User struct {
	ID             string    `gorm:"column:id;primaryKey"`
	Password       string    `gorm:"column:password"`
	Name           string    `gorm:"column:name"`
	Role           string    `gorm:"column:role"`
	WorkerID       *string   `gorm:"column:worker_id;type:uuid"`
	Token          string    `gorm:"column:token"`
	TokenExpiresAt int64     `gorm:"column:token_expires_at"`
	CreatedAt      int64     `gorm:"column:created_at;autoCreateTime:milli"`
	UpdatedAt      int64     `gorm:"column:updated_at;autoCreateTime:milli;autoUpdateTime:milli"`
	Worker         *Worker   `gorm:"foreignKey:WorkerID;references:ID"`
	Contacts       []Contact `gorm:"foreignKey:user_id;references:id"`
}

func (u *User) TableName() string {
	return "users"
}
