package converter

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
)

func BagangToResponse(bagang *entity.Bagang) *model.BagangResponse {
	return &model.BagangResponse{
		ID:        bagang.ID,
		Name:      bagang.Name,
		Isactive:  bagang.Isactive,
		UpdatedAt: bagang.UpdatedAt,
		CreatedAt: bagang.CreatedAt,
		WorkerID:  bagang.WorkerID,
		OwnerID:   bagang.OwnerID,
	}
}
