package middleware

import (
	"strings"

	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
)

func NewAuth(userUserCase *usecase.UserUseCase) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		token := strings.TrimSpace(ctx.Get("Authorization"))
		if token == "" {
			return fiber.ErrUnauthorized
		}

		request := &model.VerifyUserRequest{Token: token}
		userUserCase.Log.Debug("Authorization token received")

		auth, err := userUserCase.Verify(ctx.UserContext(), request)
		if err != nil {
			userUserCase.Log.Warnf("Failed find user by token : %+v", err)
			return fiber.ErrUnauthorized
		}

		userUserCase.Log.Debugf("User : %+v", auth.ID)
		ctx.Locals("auth", auth)
		return ctx.Next()
	}
}

func GetUser(ctx *fiber.Ctx) *model.Auth {
	auth, _ := ctx.Locals("auth").(*model.Auth)
	return auth
}

func RequireRole(roles ...string) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		auth := GetUser(ctx)
		if auth == nil {
			return fiber.ErrUnauthorized
		}

		for _, role := range roles {
			if auth.Role == role {
				return ctx.Next()
			}
		}

		return fiber.ErrForbidden
	}
}
