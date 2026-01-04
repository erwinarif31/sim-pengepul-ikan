package converter

import (
	"time"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
)

func BagangToResponse(bagang *entity.Bagang) *model.BagangResponse {
	return &model.BagangResponse{
		ID:        bagang.ID,
		Name:      bagang.Name,
		Isactive:  bagang.Isactive,
		UpdatedAt: bagang.UpdatedAt.Format(time.RFC3339),
		CreatedAt: bagang.CreatedAt.Format(time.RFC3339),
		WorkerID:  bagang.WorkerID,
		OwnerID:   bagang.OwnerID,
	}
}
