package http

import (
	"github.com/erwinarif31/catchery-api/internal/model"
	"github.com/erwinarif31/catchery-api/internal/usecase"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type BagangController struct {
	BagangUseCase *usecase.BagangUseCase
	Log           *logrus.Logger
}

func NewBagangController(useCase *usecase.BagangUseCase, log *logrus.Logger) *BagangController {
	return &BagangController{
		BagangUseCase: useCase,
		Log:           log,
	}
}

func (c *BagangController) Create(ctx *fiber.Ctx) error {
	request := new(model.BagangCreateRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("error parsing request body")
		return fiber.ErrBadRequest
	}

	response, err := c.BagangUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(model.WebResponse[*model.BagangResponse]{
		Data: response,
	})
}

func (c *BagangController) Search(ctx *fiber.Ctx) error {
	responses, err := c.BagangUseCase.Search(ctx.UserContext())
	if err != nil {
		return err
	}

	return ctx.JSON(model.WebResponse[[]model.BagangResponse]{
		Data: responses,
	})
}
