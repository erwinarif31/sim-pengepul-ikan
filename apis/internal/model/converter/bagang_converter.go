package converter

import (
	"time"

	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
)

func BagangToResponse(bagang *entity.Bagang) *model.BagangResponse {
	var workerName, ownerName string
	if bagang.Worker != nil {
		workerName = bagang.Worker.Name
	}
	if bagang.Owner != nil {
		ownerName = bagang.Owner.Name
	}

	return &model.BagangResponse{
		ID:         bagang.ID,
		Name:       bagang.Name,
		Isactive:   bagang.Isactive,
		UpdatedAt:  bagang.UpdatedAt.Format(time.RFC3339),
		CreatedAt:  bagang.CreatedAt.Format(time.RFC3339),
		WorkerID:   bagang.WorkerID,
		WorkerName: workerName,
		OwnerID:    bagang.OwnerID,
		OwnerName:  ownerName,
	}
}
