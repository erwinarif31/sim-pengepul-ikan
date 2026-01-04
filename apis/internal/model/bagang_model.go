package model

type BagangResponse struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Isactive   bool   `json:"is_active"`
	UpdatedAt  string `json:"updated_at"`
	CreatedAt  string `json:"created_at"`
	WorkerID   string `json:"worker_id"`
	WorkerName string `json:"worker_name"`
	OwnerID    string `json:"owner_id"`
	OwnerName  string `json:"owner_name"`
}

type BagangCreateRequest struct {
	Name       string `json:"name"        validate:"required"`
	IsActive   bool   `json:"is_active"`
	WorkerID   string `json:"worker_id"   validate:"uuid"`
	WorkerName string `json:"worker_name" validate:"max=255"`
	OwnerID    string `json:"owner_id"    validate:"uuid"`
	OwnerName  string `json:"owner_name"  validate:"max=255"`
}
