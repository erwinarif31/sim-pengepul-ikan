package converter

import (
	"github.com/erwinarif31/catchery-api/internal/entity"
	"github.com/erwinarif31/catchery-api/internal/model"
)

func UserToResponse(user *entity.User) *model.UserResponse {
	return &model.UserResponse{
		ID:             user.ID,
		Name:           user.Name,
		Role:           user.Role,
		WorkerID:       user.WorkerID,
		TokenExpiresAt: user.TokenExpiresAt,
		CreatedAt:      user.CreatedAt,
		UpdatedAt:      user.UpdatedAt,
	}
}

func UserToTokenResponse(user *entity.User) *model.UserResponse {
	return &model.UserResponse{
		ID:             user.ID,
		Name:           user.Name,
		Role:           user.Role,
		WorkerID:       user.WorkerID,
		Token:          user.Token,
		TokenExpiresAt: user.TokenExpiresAt,
		CreatedAt:      user.CreatedAt,
		UpdatedAt:      user.UpdatedAt,
	}
}

func UserToEvent(user *entity.User) *model.UserEvent {
	return &model.UserEvent{
		ID:        user.ID,
		Name:      user.Name,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}
