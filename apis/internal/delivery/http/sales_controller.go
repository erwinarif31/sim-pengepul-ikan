package http

import (
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type SalesController struct {
	Log          *logrus.Logger
	SalesUseCase *usecase.SalesUseCase
}

func NewSalesController(
	log *logrus.Logger,
	salesUseCase *usecase.SalesUseCase,
) *SalesController {
	return &SalesController{
		Log:          log,
		SalesUseCase: salesUseCase,
	}
}

func (c *SalesController) Search(ctx *fiber.Ctx) error {
	responses, err := c.SalesUseCase.Search(ctx.UserContext())
	if err != nil {
		return err
	}
	return ctx.JSON(model.WebResponse[[]model.SalesResponse]{
		Data: responses,
	})
}
