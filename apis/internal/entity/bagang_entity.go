package entity

type Bagang struct {
	ID        string `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()"`
	Name      string `gorm:"column:name"`
	Isactive  bool   `gorm:"column:isactive;default:true"`
	CreatedAt string `gorm:"column:created_at;default:CURRENT_TIMESTAMP"`
	UpdatedAt string `gorm:"column:updated_at;default:CURRENT_TIMESTAMP"`
	WorkerID  string `gorm:"column:worker_id"`
	OwnerID   string `gorm:"column:owner_id"`
}

func (b *Bagang) TableName() string {
	return "bagang"
}
